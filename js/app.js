$(document).ready(function () {
  cardapio.eventos.init();
});

var cardapio = {};
var MEU_CARRINHO = [];
var ADICIONAIS_SELECIONADOS = [];
var ITEMIDATUAL = null;
var MEU_ENDERECO = null;
var VALOR_CARRINHO = 0;
var VALOR_ENTREGA;
var CELULAR_EMPRESA = "5599981969893"
var VALORES_ENTREGA = {
  Altamira: 5,
  Cohab: 5,
  VilaSampaio: 7,
  VilaMariano1: 8,
  VilaMariano2: 10,
  NovabarraEFreiDamiao: 10,
  Centro: 6,
  Trizidela: 6,
  Ceramica: 6,
  Araticum: 6,
  BelaVista: 7,
  Sitio: 6,
  Incra: 6,
  VilaNenzin: 7,
  Moradas: 8,
  VilaAlvorada: 10,
  Jua: 6,
  Tamarindo: 7,
  NossaSenhoraDasCores: 6,
  FaculdadeAnhanguera: 0
}

cardapio.eventos = {
  init: () => {
    cardapio.metodos.obterItensCardapio();
    cardapio.metodos.carregarBotaoLigar();
    cardapio.metodos.carregarBotaoReserva();
    $("#txtBairro").change(cardapio.metodos.AtualizarValorEntrega);
  }
};

cardapio.metodos = {
  // Obtém a lista de itens do cardápio
  obterItensCardapio: (categoria = 'Shawarma', vermais = false) => {
    var filtro = MENU[categoria];

    if (!vermais) {
      $("#itensCardapio").html('');

      if(filtro.length > 8){
        $("#btnVerMais").removeClass("hidden");
      }else{
        $("#btnVerMais").addClass("hidden");
      }
    }

    $.each(filtro, (i, e) => {
      let temp = cardapio.templates.item.replace(/\${img}/g, e.img)
                                        .replace(/\${nome}/g, e.name)
                                        .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
                                        .replace(/\${id}/g, e.id)
                                     

      // Botão "Ver Mais" foi clicado (12 itens)
      if (vermais && i >= 8 && i < 19) {
        $("#itensCardapio").append(temp);
      }
      // Paginação inicial (8 itens)
      if (!vermais && i < 8) {
        $("#itensCardapio").append(temp);
      }
    });
    // Remove o ativo
    $('.container-menu a').removeClass('active');

    // Seta o menu para ativo
    $("#menu-" + categoria).addClass('active');
  },

  //Adiconando o Saiba mais os itens

  // Clique no botão de "Ver Mais"
  verMais: () => {
    var ativo = $(".container-menu a.active").attr('id').split('menu-')[1];
    cardapio.metodos.obterItensCardapio(ativo, true);

    $("#btnVerMais").addClass("hidden");
  },

  AdicionaisSelecionados: function (){
    let adicionais = []
    $("#modalAdicionais input[type='checkbox']:checked").each(function (){
      let adicionalID = $(this).attr("id");
      let adicional = MENU["Adicionais"].find(a => a.id == adicionalID)
      
      if(adicional){
        adicionais.push({
          name: adicional.name,
          price: adicional.price
        }
        )
      }
    })
    return adicionais
  },

  adicionarBebidaAoCarrinho: (id) => {
    var categoria = $(".container-menu a.active").attr("id").split("menu-")[1];
    //obtem a lista de itens
    let filtro = MENU[categoria];
    let item = filtro.find(i => i.id == id);

    if(item){
      let adicionais = cardapio.metodos.AdicionaisSelecionados();
      let precoTotal = parseFloat(item.price)
      if(adicionais && adicionais.length > 0){
        adicionais.forEach(adicional => {
          precoTotal += parseFloat(adicional.price);
        })
      }
      MEU_CARRINHO.push({
        ...item,
        price: precoTotal,
        adicionais: adicionais
      });
    }
    cardapio.metodos.mensagem("Item adicionado ao carrinho", "green")
    cardapio.metodos.atualizarBadgeTotal();
    cardapio.metodos.AdicionaisSelecionados();
    cardapio.metodos.fecharModalAdicionais();
},

  //Adiciona ao Carrinho o item do cardápio
  adicionarAoCarrinho: (id) => {
      id = ITEMIDATUAL;
      var categoria = $(".container-menu a.active").attr("id").split("menu-")[1];
      //obtem a lista de itens
      let filtro = MENU[categoria];
      let item = filtro.find(i => i.id == id);

      if(item){
        let adicionais = cardapio.metodos.AdicionaisSelecionados();
        let precoTotal = parseFloat(item.price)
        if(adicionais && adicionais.length > 0){
          adicionais.forEach(adicional => {
            precoTotal += parseFloat(adicional.price);
          })
        }
        MEU_CARRINHO.push({
          ...item,
          price: precoTotal,
          adicionais: adicionais
        });
      }
      cardapio.metodos.mensagem("Item adicionado ao carrinho", "green")
      cardapio.metodos.atualizarBadgeTotal();
      cardapio.metodos.AdicionaisSelecionados();
      cardapio.metodos.fecharModalAdicionais();
  },

  abrirModalAdicionais: (id) => {
      let image = ""
      let adicionaisHtml = '';
      let encontrou = false

      $.each(MENU, (categoria, itens) => {
        $.each(itens, (index, item) => {
          if(item.id === id){
            $("#modal-img").css("background-image", `url(${item.img})`)
            $(".nameadicional").text(item.name)
            $(".dsc-adicional").text(item.dsc)
            $(".price-adicionais").text("R$" + item.price)

            encontrou = true
            return false;
          }
          if(encontrou) return false
        })

      })

      $("#modal-img").html(image)

      $.each(MENU["Adicionais"], (i, e) => {
      let temp = cardapio.templates.itemAdicional.replace(/\${nome}/g, e.name)
          .replace(/\${preco}/g, e.price.toFixed(2).replace(".", ","))
          .replace(/\${id}/g, e.id)
        
        adicionaisHtml += temp;
      })

      $("#modalAdicionaisLista").html(adicionaisHtml);
      $(".container-home").addClass("hidden")
      $("#modalAdicionais").removeClass("hidden");
      ITEMIDATUAL = id;
  },

  fecharModalAdicionais: () => {
    $("#modalAdicionais").addClass("hidden");
    $(".container-home").removeClass("hidden")
    ITEMIDATUAL = null;
  },

  //Atualizar o badge de totals dos botões "Meu carrinho"
  atualizarBadgeTotal: () => {
    let total = MEU_CARRINHO.length;

    if (total > 0) {
      $(".botao-carrinho").removeClass("hidden");
      $(".container-total-carrinho").removeClass("hidden");
    }
    else{
      $(".botao-carrinho").addClass("hidden");
      $(".container-total-carrinho").addClass("hidden");
    }
    $(".badge-total-carrinho").html(total);
  },

  //Abrir a modal de carrinho
  abrirCarrinho: (abrir) => {
    event.preventDefault()
    if(abrir){
      $("#modalcarrinho").removeClass("hidden");
      cardapio.metodos.carregarCarrinho()
    }else{
      $("#modalcarrinho").addClass("hidden");
    }
  },
  
  //Altera os textos e exibe botões das etapas
  carregarEtapa: (etapa) => {
    if(etapa == 1){
      $("#lblTituloEtapa").text("Seu carrinho:");
      $("#itensCarrinho").removeClass("hidden");
      $("#localEntrega").addClass("hidden");
      $("#resumoCarrinho").addClass("hidden")

      $(".etapa").removeClass("active");
      $(".etapa1").addClass("active");

      $("#btnEtapaPedido").removeClass("hidden");
      $("#btnEtapaEndereco").addClass("hidden");
      $("#btnEtapaResumo").addClass("hidden");
      $("#btnVoltar").addClass("hidden");
    }

    if(etapa == 2){
      $("#lblTituloEtapa").text("Endereço de entrega: ");
      $("#itensCarrinho").addClass("hidden");
      $("#localEntrega").removeClass("hidden");
      $("#resumoCarrinho").addClass("hidden")

      $(".etapa").removeClass("active");
      $(".etapa1").addClass("active");
      $(".etapa2").addClass("active");

      $("#btnEtapaPedido").addClass("hidden");
      $("#btnEtapaEndereco").removeClass("hidden");
      $("#btnEtapaResumo").addClass("hidden");
      $("#btnVoltar").removeClass("hidden");
    }

    if(etapa == 3){
      $("#lblTituloEtapa").text("Resumo do Pedido:");
      $("#itensCarrinho").addClass("hidden");
      $("#localEntrega").addClass("hidden");
      $("#resumoCarrinho").removeClass("hidden")

      $(".etapa").removeClass("active");
      $(".etapa1").addClass("active");
      $(".etapa2").addClass("active");
      $(".etapa3").addClass("active");

      $("#btnEtapaPedido").addClass("hidden");
      $("#btnEtapaEndereco").addClass("hidden");
      $("#btnEtapaResumo").removeClass("hidden");
      $("#btnVoltar").removeClass("hidden");
    }
  },

  //botão de voltar etapa
  voltarEtapa: () => {
    let etapa = $(".etapa.active").length; 
    cardapio.metodos.carregarEtapa(etapa - 1);
  },

  //carrega a lista de itens do carrinho
  carregarCarrinho: () => {

    cardapio.metodos.carregarEtapa(1)

    if(MEU_CARRINHO.length > 0){
      $("#itensCarrinho").html("");

      $.each(MEU_CARRINHO, (i, e) => {
        let adicionaisHtml = "";
        let tempAdicionais = "";
        if(e.adicionais && e.adicionais.length > 0){
          adicionaisHtml = e.adicionais.map(adicional => 
            `
            <li><a class="dropdown-item" href="#">
              ${"+" + adicional.name + " R$" +  adicional.price}
            </a></li>`
          ).join("")

         tempAdicionais =  `
          <div class="dropdown">
          <span class="btn btn-secondary dropdown-toggle" type="button" data-toggle="dropdown">
              Adicionais
          </span>
          <ul class="dropdown-menu">
            ${adicionaisHtml}
          </ul>
        </div>`
        }

        let temp = cardapio.templates.itemCarrinho.replace(/\${img}/g, e.img)
        .replace(/\${nome}/g, e.name)
        .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
        .replace(/\${id}/g, e.id)
        .replace(/\${qntd}/g, e.qntd)
        .replace(/\${adicionais}/g, tempAdicionais)

        $("#itensCarrinho").append(temp);

        // Último item
        if((i + 1) == MEU_CARRINHO.length){
          cardapio.metodos.carregarValores();
        }
      })
    }else{
      $("#itensCarrinho").html('<p class="carrinho-vazio"><i class="fa fa-shopping-bag"></i> Seu Carrinho está vazio</p>')
    }
  },

  // Botão de remover item do carrinho
  removerItemCarrinho: (id) => {
    MEU_CARRINHO = $.grep(MEU_CARRINHO, (e, i) => {return e.id != id});
    cardapio.metodos.carregarCarrinho();

    //Atualiza o botão carrinho com a quantidade atualizada
    cardapio.metodos.atualizarBadgeTotal();
    cardapio.metodos.carregarValores()
  },

  //Atualiza o carrinho com a quantidade atual
  atualizarCarrinho: (id, qntd) => {

    let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id))
    MEU_CARRINHO[objIndex].qntd = qntd;

    // Atualiza o botão carrinho com a quantidade atualizada
    cardapio.metodos.atualizarBadgeTotal()

    // Atualiza os valores de SubTotal, Entrega e Total
    cardapio.metodos.carregarValores()
  },

  //carrega os valores de subTotal, Entrga e Total
  carregarValores: () => {
    VALOR_CARRINHO = 0;

    MEU_CARRINHO.forEach((item) => {
        VALOR_CARRINHO += parseFloat(item.price);
    });

    $("#lblSubTotl").text(`R$ ${VALOR_CARRINHO.toFixed(2).replace(".", ",")}`);
    $("#lblValorEntrega").text(`+ R$ ${VALOR_ENTREGA.toFixed(2).replace(".", ",")}`);
    $("#lblValorTotal").text(`R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace(".", ",")}`);
},

  carregarEndereco: () => {
    if(MEU_CARRINHO.length <= 0){
      cardapio.metodos.mensagem("Seu Carrinho está vazio");
      return;
    }
    cardapio.metodos.carregarEtapa(2);
  },

  AtualizarValorEntrega: () => {
    let bairro = $("#txtBairro").val().trim();
    let valor = VALORES_ENTREGA[bairro]
    VALOR_ENTREGA = valor

    cardapio.metodos.carregarValores();
  },

  // Validação antes de prosseguir para etapa 3
  resumoPedido: () => {
    let endereco = $("#txtEndereco").val().trim();
    let bairro = $("#txtBairro").val().trim();
    let numero = $("#txtNumero").val().trim();
    let complemento = $("#txtComplemento").val().trim();

    if(endereco.length <= 0 ){
      cardapio.metodos.mensagem("Informe o Endereço, por favor")
      $("#txtEndereco").focus();
      return;
    }

    if(bairro.length <= 0 ){
      cardapio.metodos.mensagem("Informe o Bairro, por favor")
      $("#txtBairro").focus();
      return;
    }
    
    if(numero.length <= 0 ){
      cardapio.metodos.mensagem("Informe o Número, por favor")
      $("#txtNumero").focus();
      return;
    }

    MEU_ENDERECO = {
      endereco: endereco,
      bairro: bairro,
      numero: numero,
      complemento: complemento
    }

    cardapio.metodos.carregarEtapa(3);
    cardapio.metodos.carregarResumo()
  },

  //Carrega a etapa de Resumo do pedido
  carregarResumo: () => {
    $("#listaItensResumo").html("");

    $.each(MEU_CARRINHO, (i, e) => {
      let temp = cardapio.templates.itemResumo.replace(/\${img}/g, e.img)
        .replace(/\${nome}/g, e.name)
        .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
        .replace(/\${qntd}/g, e.qntd);

      $("#listaItensResumo").append(temp);
    });

    $("#resumoEndereco").html(`${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`)
    $("#cidadeEndereco").html(`${MEU_ENDERECO.complemento}`)

    cardapio.metodos.finalizarPedido()
  },

  //Atualiza o link do botão do whatsApp
  finalizarPedido: () => {
    if (MEU_CARRINHO.length > 0 && MEU_ENDERECO != null) {
        // Cabeçalho da mensagem
        let texto = "🍽️ *PEDIDO* 🍽️\n\n";
        texto += "📋 *Itens do Pedido:*\n\n";

        // Lista de itens com adicionais
        $.each(MEU_CARRINHO, (i, e) => {
            // Item principal
            texto += `➡️ *${e.name}* - R$ ${e.price.toFixed(2).replace('.', ',')}\n`;
            
            // Adicionais do item (se houver)
            if (e.adicionais && e.adicionais.length > 0) {
                texto += `   ├ *Adicionais:*\n`;
                e.adicionais.forEach(adicional => {
                    texto += `   │    ➕ ${adicional.name} (+ R$ ${adicional.price.toFixed(2).replace('.', ',')})\n`;
                });
                texto += `   └\n`;
            } else {
                texto += `   └ *Sem adicionais*\n`;
            }
            
            texto += `\n`; // Espaço entre itens
        });

        // Totais
        texto += `\n💲 *Valores:*\n`;
        texto += `   Subtotal: R$ ${VALOR_CARRINHO.toFixed(2).replace('.', ',')}\n`;
        texto += `   Entrega: R$ ${VALOR_ENTREGA.toFixed(2).replace('.', ',')}\n`;
        texto += `   *TOTAL: R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.', ',')}*\n\n`;

        // Endereço
        texto += `🏠 *Endereço de Entrega:*\n`;
        texto += `   ${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}\n`;
        texto += `   ${MEU_ENDERECO.bairro}\n`;
        if (MEU_ENDERECO.complemento) {
            texto += `   Complemento: ${MEU_ENDERECO.complemento}\n`;
        }
        // Converte para URL do WhatsApp
        let encode = encodeURIComponent(texto);
        let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

        // Atualiza o botão
        $("#btnEtapaResumo").attr("href", URL).removeClass("hidden");
    }
},

  
  abrirDepoimento: (depoimento) => {

    $("#depoimento-1").addClass("hidden");
    $("#depoimento-2").addClass("hidden");
    $("#depoimento-3").addClass("hidden");

    $("#btnDepoimento-1").removeClass("active");
    $("#btnDepoimento-2").removeClass("active");
    $("#btnDepoimento-3").removeClass("active");

    $("#depoimento-" + depoimento).removeClass("hidden");
    $("#btnDepoimento-" + depoimento).addClass("active");

  },

  //Carrega o link do botão reserva
  carregarBotaoReserva: () => {
    var texto = "Olá! gostaria de fazer uma *reserva*";

    let encode = encodeURI(texto)
    let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

    $("#btnReserva").attr("href", URL);
  },

  //carrega o botão de ligar
  carregarBotaoLigar: () => {
    $("#btnLigar").attr("href", `tel:${CELULAR_EMPRESA}`)
  },

  //mensagens
  mensagem: (texto, cor = "red", tempo = 3500) => {
    let id = Math.floor(Date.now() * Math.random()).toString()

    let msg = `<div id="msg-${id}" class="animated fadeInDown toast ${cor}">${texto}</div>`

    $("#container_mensagens").append(msg);

    setTimeout(() => {
      $("#msg-" + id).removeClass("fadeInDown");
      $("#msg-" + id).addClass("fadeOutUp");
      setTimeout(()=>{
        $("#msg-" + id).remove();
      }, 800);
    }, tempo);
  }
};

cardapio.templates = {
  item: `
  <div class="col-12 col-lg-3 col-md-3 col-sm-6 mb-5 animated fadeInUp">
    <div class="card card-item" id="item-\${id}">
      <div class="img-produto">
        <img src="\${img}"/>
      </div>
       <p class="title-produto text-center mt-4">
         <b>\${nome}</b>
       </p>
       <div class="add-carrinho d-flex">
        <div class="price-produto">
         <b>\${preco}</b>
        </div>
        <span class="btn btn-add" onclick="cardapio.metodos.abrirModalAdicionais('\${id}')"><i class="fa fa-shopping-bag"></i></span>
       </div>
    </div>
  </div>
  `,

  itemAdicional:`
    <div class="d-flex justify-content-between align-items-center border-bottom adicional-item">
      <label class="d-flex flex-column" for="\${id}">
        <span><strong>\${nome}</strong></span>
        <small class="price-adicional">&#43;\${preco}</small>
      </label>
      <input class="bg-tertiary check-input" type="checkbox" name="\${id}" id="\${id}">
    </div>
  `,

  itemCarrinho: `
    <div class="col-12 item-carrinho">
      <div class="img-produto">
        <img src="\${img}"/>
      </div>
      <div class="dados-produto">
        <div>
          <p class="title-produto"><b>\${nome}</b></p>
          <p class="price-produto"><b>\${preco}</b></p>
        </div>
        <div class="carrinho-item-adicionais">
          \${adicionais}
        </div>
      </div>
      <div class="add-carrinho">
        <span class="btn btn-remove" onclick="cardapio.metodos.removerItemCarrinho('\${id}')"><i class="fa fa-times"></i></span>
      </div>
    </div>
  `,
  
  
   itemResumo: `
      <div class="col-12 item-carrinho resumo">
        <div class="img-produto-resumo">
          <img src="\${img}" alt="">
        </div>
        <div class="dados-produto">
          <p class="title-produto-resumo">
            <b>\${nome}</b>
          </p>
          <p class="price-produto-resumo">
            <b>R$ \${preco}</b>
          </p>
        </div>
      </div>
   `
};