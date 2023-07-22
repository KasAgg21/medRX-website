var express = require("express");
var fileuploader = require("express-fileupload");
var mysql = require("mysql2");

var app = express();
app.use(express.urlencoded(true));
app.listen(2003, function () {
    console.log("Server Live");
});

app.use(express.static("public"));
app.use(fileuploader());

app.get("/", function (req, resp) {
    resp.sendFile(process.cwd() + "/public/index.html");
})

//-----------------DB Config-----------------
var dbConfig = {
    host: "127.0.0.1",
    user: "root",
    password: "@Kas21mas",
    database: "project",
    dateStrings:true
}

var dbCon = mysql.createConnection(dbConfig);
dbCon.connect(function (jasoos) {
    if (jasoos == null)
        console.log("Connected to Database...");
    else
        console.log("Connection Failed :(");
});
app.get("/profile_page", function (req, resp) {
    resp.sendFile(process.cwd() + "/public/html_profile_page.html");
});
app.post("/profile_page_process", function (req, resp) {
    var picname = "nopic.jpg"
    if (req.files != null) {
        picname = req.files.ppic.name;
        var path = process.cwd() + "/public/uploads/" + picname;
        req.files.ppic.mv(path);
    }
    console.log(req.body);

    var emailid = req.body.ntxtei;
    var pname = req.body.ntxtn;
    var phno = req.body.ntxtcn;
    var address = req.body.ntxtad;
    var city = req.body.city;
    var dob = req.body.ntxtdob;
    var gender = req.body.ntxtg;
    var idname = "noid.jpg";
    if (req.files != null) {
        idname = req.files.ntxtid.name;
        var path = process.cwd() + "/public/uploads/" + idname;
        req.files.ntxtid.mv(path);
    }


    dbCon.query("insert into user_dat (eid,pname,phno,address,city,dob,gender,idname,picname) values (?,?,?,?,?,?,?,?,?)", [emailid, pname, phno, address, city, dob, gender, idname, picname], function (err) {
        if (err == null)
            resp.send("-----------------Recorded---------------");
        else
            resp.send(err);
    })

});

app.get("/check-emailid", function (req, resp) {
    var em = req.query.emaili;
    dbCon.query("select * from users where email=?", [em], function (err, resultTable) {
        if (err == null) {
            if (resultTable.length == 1)
                resp.send("Already Taken");
            else
                resp.send("Available");
        }
        else
            resp.send(err);
    })
});

app.get("/record", function (req, resp) {
    var em = req.query.emaili;
    var pwd = req.query.pw;
    var type = req.query.typ;
    let date = new Date();
    var curdate = date.toISOString().slice(0, 11).replace('T', ' ');
    console.log(curdate);
    dbCon.query("insert into users(email,pwd,type,dos,status) values(?,?,?,?,1)", [em, pwd, type, curdate], function (err) {
        if (err == null) {
            resp.send("Account Created");
        }
        else
            resp.send(err);
    })
});

app.get("/get-json", function (req, resp) {
    var em = req.query.emaili;
    dbCon.query("select * from users where email=?", [em], function (err, resTableJSON) {
        if (err = null)
            resp.send(resTableJSON);
        else
            resp.send(err);
    })
});

app.get("/do-update", function (req, resp) {
    var email = req.query.txtemail;
    var pwd = req.query.txtpwd;
    var type = req.query.txttyp;
    dbCon.query("update users set pwd=?,type=? where email=?", [pwd, type, email], function (err) {
        if (err = null)
            resp.send("REcord Updates");
        else
            resp.send("Not Up");
    })
});

app.get("/login", function (req, resp) {
    var em = req.query.lemaili;
    var pwd = req.query.lpw;
    dbCon.query("select type,status from users where email=? AND pwd=?", [em, pwd], function (err, rsTable) {
        console.log(rsTable);
        if (err == null) {
            if (rsTable.length == 1) {
                if (rsTable[0].status == 1)
                    resp.send(rsTable[0].type);
                else
                    resp.send("You are Blocked, Please Contact the Website Owner");
            }
            else
                resp.send("Invalid User Id/Password");
        }
        else
            resp.send(err.toString());
    })
});

app.get("/change-password", function (req, resp) {
    var em = req.query.emaili;
    var pwd = req.query.nwpw;
    dbCon.query("update users set pwd=? where email=?", [pwd, em], function (err) {
        if (err == null) {
            resp.send("Password Updated");
        }
        else
            resp.send(err);
    })
});


app.get("/check-password", function (req, resp) {
    var em = req.query.emaili;
    var pwd = req.query.owpw;
    dbCon.query("select * from users where email=? and pwd=?", [em, pwd], function (err, resTb) {
        if (err == null) {
            if (resTb.length == 1)
                resp.send("");
            else
                resp.send("Please Enter Correct Password");
        }
        else
            resp.send(err);
    })
});



app.get("/list-out-med", function (req, resp) {
    var em = req.query.emaili;
    var mednam = req.query.mdn;
    var expdate = req.query.expdt;
    var pt = req.query.pktyp;
    var qty = req.query.qty;
    dbCon.query("insert into medsavail(email,medname,expdate,pktype,qty) values(?,?,?,?,?)", [em, mednam, expdate, pt, qty], function (err) {
        if (err == null) {
            resp.send("Med Listed");
        }
        else
            resp.send(err);
    })
});

app.get("/search-d-profile", function (req, resp) {
    var em = req.query.emaili;
    dbCon.query("select * from donors where email=? ", [em], function (err, resTb) {
        if (err == null) {
            resp.send(resTb);
        }
        else
            resp.send(err);
    })
});

app.post("/save-d-profile", function (req, resp) {
    var em = req.body.txtpem;
    var picname = "nopic.jpg"
    if (req.files != null) {
        picname = req.files.pppic.name;
        var path = process.cwd() + "/public/uploads/" + picname;
        req.files.pppic.mv(path);
    }

    var name = req.body.txtnam;
    var mob = req.body.txtmob;
    var add = req.body.txtadd;
    var cty = req.body.txtcty;
    var idt = req.body.selidt;
    var fr = req.body.tmfr;
    var to = req.body.tmto;
    console.log(req.body);

    dbCon.query("insert into donors(email,dname,mobile,address,city,idtype,idname,ahfrom,ahto) values(?,?,?,?,?,?,?,?,?)", [em, name, mob, add, cty, idt, req.body.pppic, fr, to], function (err) {
        if (err == null) {
            resp.send("Updated");
        }
        else
            resp.send(err);
    })
});

app.post("/update-d-profile", function (req, resp) {
    var em = req.body.txtpem;
    var picname = "nopic.jpg"
    if (req.files != null) {
        picname = req.files.ppic.name;
        var path = process.cwd() + "/public/uploads/" + picname;
        req.files.ppic.mv(path);
    }
    else
   {
    fileName=req.body.hdn;
   }

   var name = req.body.txtnam;
    var mob = req.body.txtmob;
    var add = req.body.txtadd;
    var cty = req.body.txtcty;
    var idt = req.body.selidt;
     var fr = req.body.tmfr;
     var to = req.body.tmto;

    dbCon.query("update donors set dname=?,mobile=?,address=?,city=?,idtype=?,idname=?,ahfrom=?,ahto=? where email=?", [name, mob, add, cty, idt, picname, fr, to, em], function (err) {
        if (err == null) {
            resp.send("Updated");
        }
        else
            resp.send(err);
    })
});


app.post("/send-n-profile", function (req, resp) {
    var em = req.body.txtpem;
    var picname = "nopic.jpg"
    if (req.files != null) {
        picname = req.files.idpic.name;
        var path = process.cwd() + "/public/uploads/" + picname;
        req.files.idpic.mv(path);
    }
  console.log(req.body.gen);
   var name = req.body.txtnam;
    var mob = req.body.txtmob;
    var add = req.body.txtadd;
    var cty = req.body.txtcty;
    var gen = req.body.gen;
    var dob = req.body.dob;


    dbCon.query("insert into needy(email,nname,mobile,dob,gen,city,address,idname) values(?,?,?,?,?,?,?,?)", [em, name, mob, dob, gen, cty, add, picname], function (err) {
        if (err == null) {
            resp.send("Updated");
        }
        else
            resp.send(err);
    })
});

app.post("/update-n-profile", function (req, resp) {
    var em = req.body.txtpem;
    var picname = "nopic.jpg"
    if (req.files != null) {
        picname = req.files.ppic.name;
        var path = process.cwd() + "/public/uploads/" + picname;
        req.files.ppic.mv(path);
    }
    else
   {
    fileName=req.body.hdn;
   }

   var name = req.body.txtnam;
   var mob = req.body.txtmob;
   var add = req.body.txtadd;
   var cty = req.body.txtcty;
   var gen = req.body.gen;
   var dob = req.body.dob;

    dbCon.query("update needy set nname=?,mobile=?,dob=?,gen=?,city=?,address=?,idname=? where email=?", [name, mob,dob,gen,cty, add, picname, em], function (err) {
        if (err == null) {
            resp.send("Updated");
        }
        else
            resp.send(err);
    })
});

app.get("/search-n-profile", function (req, resp) {
    var em = req.query.emaili;
    dbCon.query("select * from needy where email=? ", [em], function (err, resTb) {
        if (err == null) {
            resp.send(resTb);
        }
        else
            resp.send(err);
    })
});

app.get("/admin", function (req, resp) {
    resp.sendFile(process.cwd() + "/public/db_admin.html");
})

app.get("/get-all-users",function(req,resp){
    dbCon.query("select * from users",function(err,resTb)
    {
        if(err==null)
        {
            resp.send(resTb);
        }
        else
        resp.send(err);
    })
});

app.get("/block-users",function(req,resp){
    var em=req.query.email;
    dbCon.query("update users set status=0 where email=?",[em],function(err,resTb)
    {
        if(err==null)
        {
            resp.send(resTb);
        }
        else
        resp.send(err);
    })
});

app.get("/unblock-users",function(req,resp){
    var em=req.query.email;
    dbCon.query("update users set status=1 where email=?",[em],function(err,resTb)
    {
        if(err==null)
        {
            resp.send(resTb);
        }
        else
        resp.send(err);
    })
});

app.get("/get-all-donors",function(req,resp){
    dbCon.query("select * from donors",function(err,resTb)
    {
        if(err==null)
        {
            resp.send(resTb);
        }
        else
        resp.send(err);
    })
});

app.get("/get-all-needy",function(req,resp){
    dbCon.query("select * from needy",function(err,resTb)
    {
        if(err==null)
        {
            resp.send(resTb);
        }
        else
        resp.send(err);
    })
});

app.get("/get-all-listedmeds",function(req,resp){
    dbCon.query("select * from medsavail where email=?",[req.query.email],function(err,resTb)
    {
        if(err==null)
        {
            resp.send(resTb);
        }
        else
        resp.send(err);
    })
});

app.get("/donated",function(req,resp){
    var medname=req.query.medname;
    dbCon.query("delete from medsavail where medname=?",[medname],function(err,resTb)
    {
        if(err==null)
        {
            resp.send(resTb);
        }
        else
        resp.send(err);
    })
});

app.get("/fetch-med",function(req,resp){
    dbCon.query("select distinct medname from medsavail",function(err,resTb)
    {
        if(err==null)
        {
            resp.send(resTb);
        }
        else
        resp.send(err);
    })
});

app.get("/fetch-city",function(req,resp){
    dbCon.query("select distinct city from donors",function(err,resTb)
    {
        if(err==null)
        {
            resp.send(resTb);
        }
        else
        resp.send(err);
    })
});

app.get("/search-donors",function(req,resp)
{
  console.log(req.query);
  var med=req.query.medname;
  var city=req.query.city;

  var query="select donors.*,medsavail.medname from donors  inner join medsavail on donors.email= medsavail.email where medsavail.medname=? and donors.city=?";
  
  dbCon.query(query,[med,city],function(err,resultTable)
  {
    console.log(resultTable+"      "+err);
  if(err==null)
    resp.send(resultTable);
  else
    resp.send(err);
  })
})