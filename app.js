// =====================
// 💰 FORMATO COP
// ====================
function formatoCOP(v){
  return "$" + Number(v||0).toLocaleString("es-CO");
}

// =====================
// 🔐 USUARIO BASE
// =====================
if(!localStorage.getItem("usuarios")){
  localStorage.setItem("usuarios", JSON.stringify([
    {
      cc:"1016949556",
      nombre:"Admin",
      pass:"123456",
      rol:"admin"
    }
  ]));
}

// =====================
// 🚀 INIT
// =====================
if(!localStorage.getItem("init")){
  localStorage.setItem("clientes", JSON.stringify([]));
  localStorage.setItem("inventario", JSON.stringify([]));
  localStorage.setItem("pedidos", JSON.stringify([]));
  localStorage.setItem("gastos", JSON.stringify([]));
  localStorage.setItem("init","true");
}

// =====================
// 🔑 LOGIN
// =====================
function login(){
  let u = document.getElementById("user").value;
  let p = document.getElementById("pass").value;

  let users = JSON.parse(localStorage.getItem("usuarios"));
  let ok = users.find(x=>x.cc===u && x.pass===p);

  if(ok){
    localStorage.setItem("usuarioActivo", JSON.stringify(ok));
    window.location="dashboard.html";
  }else{
    alert("Credenciales incorrectas");
  }
}

// =====================
// 🔒 SESIÓN
// =====================
function verificarSesion(){
  if(!localStorage.getItem("usuarioActivo")){
    window.location="index.html";
  }
}

// =====================
// 🚪 LOGOUT
// =====================
function logout(){
  localStorage.removeItem("usuarioActivo");
  window.location="index.html";
}

// =====================
// 👋 BIENVENIDA
// =====================
function mostrarBienvenida(){
  let user = JSON.parse(localStorage.getItem("usuarioActivo"));
  if(!user) return;

  let titulo = document.querySelector(".main h1");
  if(titulo){
    titulo.innerText = "Bienvenido " + user.nombre;
  }

  let btn = document.createElement("button");
  btn.innerText = "Cerrar sesión";
  btn.onclick = logout;
  document.querySelector(".main").prepend(btn);
}

document.addEventListener("DOMContentLoaded", ()=>{
  verificarSesion();
  mostrarBienvenida();
});

// =====================
// 🧭 NAV
// =====================
function mostrarSeccion(s){
  let user = JSON.parse(localStorage.getItem("usuarioActivo"));

  if(s==="empleados" && user.rol !== "admin"){
    alert("Solo admin");
    return;
  }

  if(s==="empleados") mostrarEmpleados();
  if(s==="clientes") mostrarClientes();
  if(s==="inventario") mostrarInventario();
  if(s==="pedidos") mostrarPedidos();
  if(s==="gastos") mostrarGastos();
  if(s==="ventas") mostrarVentas();
}

// =====================
// 👨‍💼 EMPLEADOS
// =====================
function mostrarEmpleados(){
  let u = JSON.parse(localStorage.getItem("usuarios"));

  document.getElementById("contenido").innerHTML=`
  <div class="card">
  <h2>Empleados</h2>

  <input id="cc" placeholder="Cédula">
  <input id="nombre" placeholder="Nombre completo del empleado">
  <input id="pp" placeholder="Contraseña">
  <input id="tel" placeholder="Teléfono">
  <input id="eps" placeholder="EPS">

  <label><strong>Fecha de nacimiento</strong></label>
  <input type="date" id="fn">

  <label><strong>Fecha de ingreso a la empresa</strong></label>
  <input type="date" id="fi">

  <select id="rol">
    <option value="empleado">Empleado</option>
    <option value="admin">Admin</option>
  </select>

  <button onclick="addEmp()">Crear empleado</button>

  <hr>

  ${u.map((x,i)=>`
    <p>
    👤 ${x.nombre || "Sin nombre"} | CC: ${x.cc} | EPS: ${x.eps || "N/A"}
    <br>
    🎂 Nacimiento: ${x.fn || "-"} | 🏢 Ingreso: ${x.fi || "-"} | Rol: ${x.rol}
    <br>
    <button onclick="delEmp(${i})">❌</button>
    </p>
  `).join("")}
  </div>`;
}

function addEmp(){
  let cc = document.getElementById("cc").value;
  let nombre = document.getElementById("nombre").value;
  let pp = document.getElementById("pp").value;
  let tel = document.getElementById("tel").value;
  let eps = document.getElementById("eps").value;
  let fn = document.getElementById("fn").value;
  let fi = document.getElementById("fi").value;
  let rol = document.getElementById("rol").value;

  if(!nombre){
    alert("Ingrese nombre");
    return;
  }

  let edad = new Date().getFullYear() - new Date(fn).getFullYear();
  if(edad < 18){
    alert("Menor de edad");
    return;
  }

  let u = JSON.parse(localStorage.getItem("usuarios"));
  if(u.find(x=>x.cc===cc)){
    alert("Cédula ya existe");
    return;
  }

  u.push({cc,nombre,pass:pp,tel,eps,fn,fi,rol});
  localStorage.setItem("usuarios", JSON.stringify(u));

  mostrarEmpleados();
}

function delEmp(i){
  if(!confirm("Eliminar empleado?")) return;
  let u = JSON.parse(localStorage.getItem("usuarios"));
  u.splice(i,1);
  localStorage.setItem("usuarios", JSON.stringify(u));
  mostrarEmpleados();
}

// =====================
// 👥 CLIENTES
// =====================
function mostrarClientes(){
  let cl=JSON.parse(localStorage.getItem("clientes"));

  document.getElementById("contenido").innerHTML=`
  <div class="card">
  <h2>Clientes</h2>

  <input id="empresa" placeholder="Empresa">
  <input id="nombre" placeholder="Contacto">

  <button onclick="addCl()">Agregar</button>

  <hr>

  ${cl.map((x,i)=>`
    <p>${x.empresa} | ${x.nombre}
    <button onclick="delCl(${i})">❌</button></p>
  `).join("")}
  </div>`;
}

function addCl(){
  let empresa=document.getElementById("empresa").value;
  let nombre=document.getElementById("nombre").value;

  let cl=JSON.parse(localStorage.getItem("clientes"));
  cl.push({empresa,nombre});
  localStorage.setItem("clientes",JSON.stringify(cl));
  mostrarClientes();
}

function delCl(i){
  if(!confirm("Eliminar cliente?")) return;
  let cl=JSON.parse(localStorage.getItem("clientes"));
  cl.splice(i,1);
  localStorage.setItem("clientes",JSON.stringify(cl));
  mostrarClientes();
}

// =====================
// 📦 INVENTARIO
// =====================
function mostrarInventario(){
  let inv=JSON.parse(localStorage.getItem("inventario"));

  document.getElementById("contenido").innerHTML=`
  <div class="card">
  <h2>Inventario</h2>

  <input id="p" placeholder="Producto">
  <input id="q" placeholder="Cantidad">

  <button onclick="addInv()">Agregar</button>

  <hr>

  ${inv.map((x,i)=>`
    <p>${x.producto} - ${x.cantidad}
    <button onclick="delInv(${i})">❌</button></p>
  `).join("")}
  </div>`;
}

function addInv(){
  let p=document.getElementById("p").value;
  let q=parseInt(document.getElementById("q").value);

  let inv=JSON.parse(localStorage.getItem("inventario"));
  inv.push({producto:p,cantidad:q});
  localStorage.setItem("inventario",JSON.stringify(inv));
  mostrarInventario();
}

function delInv(i){
  if(!confirm("Eliminar producto?")) return;
  let inv=JSON.parse(localStorage.getItem("inventario"));
  inv.splice(i,1);
  localStorage.setItem("inventario",JSON.stringify(inv));
  mostrarInventario();
}

// =====================
// 📦 PEDIDOS (AUTOR)
// =====================
function mostrarPedidos(){
  let cl=JSON.parse(localStorage.getItem("clientes"));
  let inv=JSON.parse(localStorage.getItem("inventario"));
  let ped=JSON.parse(localStorage.getItem("pedidos"));

  document.getElementById("contenido").innerHTML=`
  <div class="card">
  <h2>Pedidos</h2>

  <select id="cli">${cl.map(x=>`<option>${x.empresa}</option>`)}</select>
  <select id="pro">${inv.map(x=>`<option>${x.producto}</option>`)}</select>

  <input id="c" placeholder="Cantidad">

  <button onclick="addPedido()">Crear</button>

  <hr>

  ${ped.map((x,i)=>`
    <p>
    ${x.cliente} - ${x.producto} (${x.cantidad})
    <small>añadido por ${x.autor}</small>
    <button onclick="delPedido(${i})">❌</button>
    </p>
  `).join("")}
  </div>`;
}

function addPedido(){
  let user = JSON.parse(localStorage.getItem("usuarioActivo"));

  let cli=document.getElementById("cli").value;
  let pro=document.getElementById("pro").value;
  let c=parseInt(document.getElementById("c").value);

  let inv=JSON.parse(localStorage.getItem("inventario"));
  let ped=JSON.parse(localStorage.getItem("pedidos"));

  let prod=inv.find(x=>x.producto===pro);

  let usados=ped.filter(x=>x.producto===pro)
    .reduce((a,b)=>a+(b.cantidad||0),0);

  if(usados + c > prod.cantidad){
    alert("Sin stock");
    return;
  }

  ped.push({
    cliente:cli,
    producto:pro,
    cantidad:c,
    autor:user.nombre
  });

  localStorage.setItem("pedidos",JSON.stringify(ped));
  mostrarPedidos();
}

function delPedido(i){
  if(!confirm("Eliminar pedido?")) return;
  let ped=JSON.parse(localStorage.getItem("pedidos"));
  ped.splice(i,1);
  localStorage.setItem("pedidos",JSON.stringify(ped));
  mostrarPedidos();
}

// =====================
// 📊 VENTAS
// =====================
function mostrarVentas(){
  let ped=JSON.parse(localStorage.getItem("pedidos"));

  document.getElementById("contenido").innerHTML=`
  <div class="card">
  <h2>Ventas</h2>
  <p>Total pedidos: ${ped.length}</p>
  </div>`;
}