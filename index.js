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

app.use(function(req, res, next){
    res.status(401).send('Page not found. Try later again!')
})

app.listen(8080,()=>{
    console.log("Server ligado!")
})