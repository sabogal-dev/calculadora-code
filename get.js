const inputFactura = document.querySelector(".inputFactura")
const btnBuscar = document.querySelector(".btnBuscar")
const tabla = document.querySelector(".tabla")
btnBuscar.addEventListener("click", buscar)

const tarjetaPagos = document.querySelector(".tarjetaPagos ul")
const tarjetaPagosTotal = document.querySelector(".tarjetaPagos")
const cliente = document.querySelector(".cliente")
const fechaFact = document.querySelector(".fechaFact")
const fechaFactVence = document.querySelector(".fechaFactVence")
const documento = document.querySelector(".documento")
const precioOdoo = document.querySelector(".precioOdoo")

const ivaCheck = document.querySelector(".check input")
const iva = document.querySelector(".iva")

const reteCheck = document.querySelector(".retefuenteCheck input")
const retefuente = document.querySelector(".retefuente")

const diasDescuento = document.querySelector(".diasDescuento")
const subTotal = document.querySelector(".subtotal")
const ahorro = document.querySelector(".ahorro")
const totalPago = document.querySelector(".totalPago")

const marcas = ["LINE", "TR90", "PET", "PREMIUM", "TONELLY", "OH", "FORZA"]


let descuentos = {
    LINE: 0,
    TR90: 0,
    PETITE: 0,
    PREMIUM: 0,
    TONELLY: 0,
    OH: 0,
    FORZANY: 0
}
let datosCategoriaProducto;


//eventos cliack
function buscar(e) {
    e.preventDefault();
    const factura = inputFactura.value
    if (factura) {
        limpiarDescuentos();
        categoriasProducto(inputFactura.value.toUpperCase());
    }
    else {
        alert("introducir factura")
    }
}

ivaCheck.addEventListener("change", () => {
    renderTabla(datosCategoriaProducto);
})

reteCheck.addEventListener("change", () => {
    renderTabla(datosCategoriaProducto);
    console.log(reteCheck.checked)
})

// funciones-------------------------------



async function categoriasProducto(factura) {

    const apis = await api(factura);
    const resultado = []
    apis.listaProductos.result.forEach(montura => {
        const listItem = [montura.name, montura.quantity, montura.price_unit]
        resultado.push(listItem)
    });
    datosCategoriaProducto = resultado;
    renderDatos(apis)
    renderPagos(apis)
    renderTabla(resultado)

}

function renderTabla(resultado) {
    let valorDescuento = 0;
    let ValorSubtotal = 0;
    limpiarTabla()
    marcas.forEach(marca => {

        const cantidad = resultado.filter((item) => { return item[0].includes(`${marca}`) })
        let sumaCant = 0;
        const tr = document.createElement("tr");
        const marcaTd = document.createElement("td")
        const cantidadTd = document.createElement("td")
        const precioTd = document.createElement("td")
        const subTotalTd = document.createElement("td")
        const seleccion = document.createElement("select")
        seleccion.innerHTML = `
                            <option value="0" selected>0%</option>
                            <option value="0.05">5%</option>
                            <option value="0.1">10%</option>
                            <option value="0.15">15%</option>
                            <option value="0.2">20%</option>
                        `
        const totalTd = document.createElement("td")

        marcaTd.textContent = marca;

        seleccion.value = descuentos[`${marca}`]

        cantidad.forEach(element => {
            sumaCant = sumaCant + element[1];
        });

        cantidadTd.textContent = sumaCant



        // si no hay cantidades de un producto entonces no calcula totales
        if (cantidad.length !== 0) {
            precioTd.textContent = cantidad[0][2]
            subTotalTd.innerText = cantidadTd.textContent * precioTd.textContent
        } else {
            precioTd.textContent = 0
            subTotalTd.innerText = 0
        }
        seleccion.addEventListener("change", (e) => {
            const descuento = seleccion.value
            descuentos[`${marca}`] = descuento
            renderTabla(resultado)
        })

        totalTd.innerText = subTotalTd.innerText - (subTotalTd.innerText * seleccion.value)


        valorDescuento = valorDescuento + (totalTd.innerText - subTotalTd.innerText)
        ValorSubtotal = ValorSubtotal + parseInt(subTotalTd.innerText)




        tr.appendChild(marcaTd)
        tr.appendChild(cantidadTd)
        tr.appendChild(precioTd)
        tr.appendChild(subTotalTd)
        tr.appendChild(seleccion)
        tr.appendChild(totalTd)
        tabla.appendChild(tr)
    });


    if (ivaCheck.checked) {
        iva.innerText = (ValorSubtotal * 19 / 100)
    }
    else {
        iva.innerText = 0
    }

    if (reteCheck.checked) {
        console.log(retefuente.innerHTML)
        retefuente.textContent = (ValorSubtotal * 0.025)
        console.log(retefuente.innerHTML)
    }
    else {
        retefuente.innerText = 0
    }


    subTotal.innerText = (ValorSubtotal).toLocaleString("es-ES")
    ahorro.innerText = valorDescuento.toLocaleString("es-ES")
    totalPago.innerText = ((ValorSubtotal + valorDescuento + parseFloat(iva.innerText)) - retefuente.innerText).toLocaleString("es-ES")
    iva.innerText = parseFloat(iva.innerText).toLocaleString("es-ES")
    retefuente.innerText = parseFloat(retefuente.innerText).toLocaleString("es-ES")

}

function limpiarDescuentos() {
    marcas.forEach(element => {
        descuentos[`${element}`] = 0;
    })
}

function limpiarTabla() {
    tabla.innerHTML = ""
}
function limpiarTarjetaPagos(){
    tarjetaPagos.innerHTML = ""
    const h4 = tarjetaPagosTotal.querySelector("h4")
    if(h4){
        h4.remove();
    }
}
function renderDatos(datos) {
    cliente.innerText = datos.infofac.result[0].partner_id[1]
    fechaFact.innerText = datos.infofac.result[0].invoice_date
    fechaFactVence.innerText = datos.infofac.result[0].invoice_date_due
    documento.innerText = datos.infofac.result[0].name

    precioOdoo.innerText = (datos.infofac.result[0].amount_total).toLocaleString("es-ES")
    diasDescuento.innerText = calcularDiferenciaDias(fechaFactVence.innerText)

}

function renderPagos(datos) {
    limpiarTarjetaPagos();
    const pagos = JSON.parse(datos.infofac.result[0].invoice_payments_widget).content

    let pagoSuma = 0;
    pagos.forEach(element => {
        pagoSuma = pagoSuma + element.amount


        const pagLi = document.createElement("li")
        const pagSpan = document.createElement("span")

        pagLi.innerText = "$" + (element.amount).toLocaleString("es-ES") + " -- ";
        pagSpan.innerText = element.ref;

        pagLi.appendChild(pagSpan)

        tarjetaPagos.appendChild(pagLi)

    });

    const pagH4 = document.createElement("h4")
    pagH4.innerText = "pagado : $" + (pagoSuma).toLocaleString("es-ES")

    tarjetaPagosTotal.appendChild(pagH4)


}
async function api(factura) {
    const get = await fetch(`https://sabogal.top/api?fac=${factura}`)
    const data = await get.json() // Convertir a JSON

    return data
}

function calcularDiferenciaDias(fecha) {
    // Convertir las fechas a objetos Date
    let date1 = new Date(Date.now());
    let date2 = new Date(fecha);

    // Calcular la diferencia en milisegundos
    let diferenciaMs = date2 - date1;

    // Convertir milisegundos a días
    let dias = diferenciaMs / (1000 * 60 * 60 * 24);

    return Math.round(dias); // Redondeamos para evitar decimales
}



