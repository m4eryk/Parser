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


function parseJsonToXml(o) {

    var toXml = function(v, name, ind) {
       var xml = "";
       if (v instanceof Array) {
          for (var i=0, n=v.length; i<n; i++)
             xml += ind + toXml(v[i], name, ind+"\t") + "\n";
       }
       else if (typeof(v) == "object") {
          var hasChild = false;
          xml += ind + "<" + name;
          for (var m in v) {
             if (m.charAt(0) == "@")
                xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
             else
                hasChild = true;
          }
          xml += hasChild ? ">" : "/>";
          if (hasChild) {
             for (var m in v) {
                if (m == "#text")
                   xml += v[m];
                else if (m.charAt(0) != "@")
                   xml += toXml(v[m], m, ind+"\t");
             }
             xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</" + name + ">";
          }
       }
       else {
          xml += ind + "<" + name + ">" + v.toString() +  "</" + name + ">";
       }
       return xml;
    }, xml="";
    for (var m in o)
       xml += toXml(o[m], m, "");
    return xml.replace(/\t/g, '\n');
}

function parseXmlToJson(xml) {
    
    console.log(xml);
    var X = {
       toObj: function(xml) {
        console.log("toObj");
        
          var o = {};
          if (xml.nodeType==1) {   // проверка наличая узла
             if (xml.attributes.length)   // есть ли атрибут
                for (var i=0; i<xml.attributes.length; i++)
                   o["@"+xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue||"").toString();
             if (xml.firstChild) { // наличее дочерних узлов
                var textChild=0, hasElementChild=false;
                for (var n=xml.firstChild; n; n=n.nextSibling) {
                   if (n.nodeType==1) hasElementChild = true;
                   else if (n.nodeType==3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; //текст с пробелами
                }
                if (hasElementChild) {
                   if (textChild < 2 ) { // только текстовый узел
                      console.log(textChild);
                      X.removeWhite(xml);
                      for (var n=xml.firstChild; n; n=n.nextSibling) {
                         if (n.nodeType == 3)  // проверка
                            o["#text"] = X.escape(n.nodeValue);
                         else if (o[n.nodeName]) {  // частое появление 
                               if (o[n.nodeName] instanceof Array)
                                  o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                               else
                                  o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                            }
                         else  // первое появление ? 
                            o[n.nodeName] = X.toObj(n);
                      }
                   }
                }
                else if (textChild) { //текст 
                   if (!xml.attributes.length)
                      o = X.escape(X.innerXml(xml));
                   else
                      o["#text"] = X.escape(X.innerXml(xml));
                }
             }
             if (!xml.attributes.length && !xml.firstChild) o = null;
          }
          return o;
       },
       toJson: function(o, name, ind) {
          var json = name ? ("\""+name+"\"") : "";
          if (typeof(o) == "object") {
             var arr = [];
             for (var m in o)
                arr[arr.length] = X.toJson(o[m], m, ind+"\t");
             json += (name? ":{" : "{") + (arr.length > 1 ? ("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind) : arr.join("")) + "}";
          }
          return json;
       },
       innerXml: function(node) {
          var s = ""
             var asXml = function(n) { // в хмл
                var s = "";
                if (n.nodeType == 1) {
                   s += "<" + n.nodeName;
                   for (var i=0; i<n.attributes.length;i++)
                      s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue||"").toString() + "\"";
                   if (n.firstChild) {
                      s += ">";
                      for (var c=n.firstChild; c; c=c.nextSibling)
                         s += asXml(c);
                      s += "</"+n.nodeName+">";
                   }
                   else
                      s += "/>";
                }
                else if (n.nodeType == 3)
                   s += n.nodeValue;
                return s;
             };
             for (var c=node.firstChild; c; c=c.nextSibling)
                s += asXml(c);
          
          return s;
       },
       escape: function(txt) {
          return txt.replace(/[\\]/g, "\\\\").replace(/[\"]/g, '\\"').replace(/[\n]/g, '\\n').replace(/[\r]/g, '\\r'); //проверка
       },
       removeWhite: function(e) {
        console.log(e);
        e.normalize;
          for (var n = e.firstChild; n; ) {
             if (n.nodeType == 3) {  //тектс узел 
                if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // чистый тектст
                   var nxt = n.nextSibling;
                   e.removeChild(n);
                   n = nxt;
                }
                else
                   n = n.nextSibling;
             }
             else if (n.nodeType == 1) {  // узел
                X.removeWhite(n);
                n = n.nextSibling;
             }
          
          }
          return e;
       }
    };
    if (xml.nodeType == 9) {
       xml = xml.documentElement;
       console.log(xml);
    }
    var json = X.toJson(X.toObj(xml), xml.nodeName, "\t");
    return "{\n" + "\t" +  json.replace(/\t/g, "\t")  + "\n}";
}


























