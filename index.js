const express = require('express');
const app = express();
const bodyParser = require('body-parser')
app.use(express.static('public'))
app.use(express.static('public'));
app.set('view engine', 'ejs');
const axios = require('axios');
const { request } = require('express');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get("/",(req,res)=>{
    var error;
    var unfound;
    var message;
    res.render("index", {error: error, unfound: unfound, message: message})
})

app.post("/api", (req,res)=>{
    var cnpj = req.body.cnpj
    var cnpjformat = cnpj.replaceAll('.','').replaceAll('/','').replaceAll('-','')
    if(cnpj.length < 18){
        var error = ("Tamanho inválido");
        var unfound;
        var message;
        res.render("index", {error: error, unfound: unfound, message: message})
    }else{
        axios.get(`https://receitaws.com.br/v1/cnpj/${cnpjformat}`).then(request =>{
        //console.log(request);
        var status = request.data['status'];
        var dados = request.data;
        var unfound = ("Cnpj não encontrado");
        var error;
        //console.log("-----------------------" + dados)
        if(status == 'ERROR'){
            res.render("index", {error: error, unfound: unfound, message: message})
        }
        else{
            res.render("retorno",{
                nome:  dados['nome'],
                fantasia: dados['fantasia'] == '' ? 'Não encontrado' : dados['fantasia'],
                cnpj: dados['cnpj'],
                data_situacao: dados['data_situacao'],
                situacao: dados['situacao'],
                motivo: dados['motivo_situacao'] == '' ? 'Não encontrado' : dados['motivo_situacao']
            })
        }
        
    }).catch(error2 =>{
        var error;
        var unfound;
        var message = `Muitas consultas feitas, aguarde um minuto!`
        //console.log(error['response']['status'])
        if(error2['response']['status'] == 429){
            res.render("index", {error: error, unfound: unfound, message: message})
        }
    })}
    
})

app.post("/consulta", (req,res)=>{
    var cnpj = req.body.cnpj_pedido
    console.log(cnpj)
    axios.post(`http://10.86.201.48:2222/v1/api/data`, {cnpj_pedido: cnpj}).then(resp =>{
        var dados = resp.data
        console.log(dados)
        res.render("pedidos",{
            pedido: dados['nropredvenda'],
            seqpessoa: dados['seqpessoa'],
            fantasia: dados['fantasia'],
            cnpj: dados['cpf_cnpj'],
            situacao: dados['status']
        })
    })
})

app.post("/separacao", (req,res)=>{
    var pedido = req.body.separacao
    console.log(pedido)
    if(pedido == '' || pedido == undefined){
        res.redirect("/")
    }else if(pedido.length < 18){
        res.redirect("/")
    }else{
        var pedidoformat = pedido.replaceAll('.','').replaceAll('/','').replaceAll('-','')
        axios.get(`http://10.86.201.48:4040/separacao/${pedidoformat}`).then(result => {
            if(result.data['return'][0]['STATUS'] == 'LIBERADO'){
                res.redirect("/")
            }else{
                console.log( result.data['return'])
                res.render("separacao",{
                    status: result.data['return'],
                })    
            }
        })
    }
   
})

app.use(function(req, res, next){
    res.status(401).send('Page not found. Try later again!')
})

app.listen(8080,()=>{
    console.log("Server ligado!")
})