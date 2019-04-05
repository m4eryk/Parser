const express = require('express');

var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json());
app.use(bodyParser.text());


app.get( '/', function (req, res){
    res.send('Hello, im server');
})

app.post( '/parseXmlToJson', function(req, res){
    
    console.log(req.body);
    res.send(parseXmlToJson(req.body));
})

app.post( '/parseJsonToXml', function(req, res){
    
    console.log(req.body);
    res.send(parseJsonToXml(req.body));
})

app.listen(3000, function(){
    console.log('server work');
})


function parseJsonToXml(obj) {

    var toXml = function(value, name, ind) {
       var xml = "";
       if (value instanceof Array) {
          for (var i=0, n=value.length; i<n; i++)
             xml += ind + toXml(value[i], name, ind+"\t") + "\n";
       }
       else if (typeof(value) == "object") {
          var hasChild = false;
          xml += ind + "<" + name;
          for (var val in value) {
             if (val.charAt(0) == "@")
                xml += " " + val.substr(1) + "=\"" + value[val].toString() + "\"";
             else
                hasChild = true;
          }
          xml += hasChild ? ">" : "/>";
          if (hasChild) {
             for (var val in value) {
                if (val == "#text")
                   xml += value[val];
                else if (val.charAt(0) != "@")
                   xml += toXml(value[val], val, ind+"\t");
             }
             xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</" + name + ">";
          }
       }
       else {
          xml += ind + "<" + name + ">" + value.toString() +  "</" + name + ">";
       }
       return xml;
    }, xml="";
    for (var o in obj)
       xml += toXml(obj[o], o, "");
    return xml.replace(/\t/g, '\n');
}

function parseXmlToJson(xml) {
    
    console.log(xml);
    var X = {
       toObj: function(xml) {
        console.log("toObj");
        
          var obj = {};
          if (xml.nodeType==1) {   // проверка наличая узла
             if (xml.attributes.length)   // есть ли атрибут
                for (var i=0; i<xml.attributes.length; i++)
                   obj["@"+xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue||"").toString();
             if (xml.firstChild) { // наличее дочерних узлов
                var textChild=0, hasElementChild=false;
                for (var node=xml.firstChild; node; node=node.nextSibling) {
                   if (node.nodeType==1) hasElementChild = true;
                   else if (node.nodeType==3 && node.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; //текст с пробелами
                }
                if (hasElementCodehild) {
                   if (textChild < 2 ) { // только текстовый узел
                      console.log(textChild);
                      X.removeWhite(xml);
                      for (var node=xml.firstChild; node; node=node.nextSibling) {
                         if (node.nodeType == 3)  // проверка
                            obj["#text"] = X.escape(node.nodeValue);
                         else if (obj[node.nodeName]) {  // частое появление 
                               if (obj[node.nodeName] instanceof Array)
                                  obj[node.nodeName][obj[node.nodeName].length] = X.toObj(node);
                               else
                                  obj[n.nodeName] = [obj[node.nodeName], X.toObj(node)];
                            }
                         else  // первоеode появление ? 
                            obj[node.nodeName] = X.toObj(node);
                      }
                   }
                }
                else if (textChild) { //текст 
                   if (!xml.attributes.length)
                      obj = X.escape(X.innerXml(xml));
                   else
                      obj["#text"] = X.escape(X.innerXml(xml));
                }
             }
             if (!xml.attributes.length && !xml.firstChild) o = null;
          }
          return obj;
       },
       toJson: function(obj, name, ind) {
          var json = name ? ("\""+name+"\"") : "";
          if (typeof(obj) == "object") {
             var arr = [];
             for (var m in obj)
                arr[arr.length] = X.toJson(o[m], m, ind+"\t");
             json += (name? ":{" : "{") + (arr.length > 1 ? ("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind) : arr.join("")) + "}";
          }
          return json;
       },
       innerXml: function(node) {
          var str = ""
             var asXml = function(n) { // в хмл
                var str = "";
                if (n.nodeType == 1) {
                   str += "<" + n.nodeName;
                   for (var i=0; i<n.attributes.length;i++)
                      str += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue||"").toString() + "\"";
                   if (n.firstChild) {
                      str += ">";
                      for (var c=n.firstChild; c; c=c.nextSibling)
                         str += asXml(c);
                      str += "</"+n.nodeName+">";
                   }
                   else
                      str += "/>";
                }
                else if (n.nodeType == 3)
                   str += n.nodeValue;
                return str;
             };
             for (var c=node.firstChild; c; c=c.nextSibling)
                str += asXml(c);
          
          return str;
       },
       escape: function(txt) {
          return txt.replace(/[\\]/g, "\\\\").replace(/[\"]/g, '\\"').replace(/[\n]/g, '\\n').replace(/[\r]/g, '\\r'); //проверка
       },
       removeWhite: function(val) {
        console.log(val);
        val.normalize;
          for (var node = e.firstChild; n; ) {
             if (node.nodeType == 3) {  //тектс узел 
                if (!node.nodeValue.match(/[^ \f\n\r\t\v]/)) { // чистый тектст
                   var nxt = n.nextSibling;
                   val.removeChild(node);
                   node = nxt;
                }
                else
                   node = node.nextSibling;
             }
             else if (node.nodeType == 1) {  // узел
                X.removeWhite(node);
                node = node.nextSibling;
             }
          
          }
          return val;
       }
    };
    if (xml.nodeType == 9) {
       
       xml = xml.documentElement;
       console.log(xml);
    }
    var json = X.toJson(X.toObj(xml), xml.nodeName, "\t");
    return "{\n" + "\t" + json.replace(/\t/g, "\t")  + "\n}";
}













































