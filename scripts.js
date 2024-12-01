const apiKey = "8175fA5f6098c5301022f475da32a2aa";
let authToken = "";
let currentIndex = 1;
const totalRecords = 105;

// Elementos
const albumGrid = $("#album-grid");
const loadingIndicator = $("#loading");

// Mostrar e ocultar o loading durante requisições
$(document).ajaxStart(function () {
  loadingIndicator.show(); // Exibir o indicador de loading ao iniciar requisições
});

$(document).ajaxStop(function () {
  loadingIndicator.hide(); // Ocultar o indicador de loading ao finalizar todas as requisições
});

// Autenticar e obter token
function authenticate() {
  return $.ajax({
    url: "https://ucsdiscosapi.azurewebsites.net/Discos/autenticar",
    method: "POST",
    headers: {
      chaveapi: apiKey,
    },
    success: function (data) {
      authToken = data;
    },
    error: function () {
      console.error("Erro ao autenticar.");
    },
  });
}

// Carregar registros de discos
function loadRecords(startIndex, quantity) {
  return $.ajax({
    url: `https://ucsdiscosapi.azurewebsites.net/Discos/records?numeroInicio=${startIndex}&quantidade=${quantity}`,
    method: "GET",
    headers: {
      tokenapiucs: authToken,
    },
    success: function (records) {
      records.forEach(createAlbumCard);
    },
    error: function () {
      console.error("Erro ao carregar registros.");
    },
  });
}

// Criar elemento de card para cada disco
function createAlbumCard(record) {
  const col = $(`
    <div class="col">
      <img src="data:image/jpeg;base64,${record.imagemEmBase64}" class="album-image" alt="Album ${record.id}" data-id="${record.id}">
    </div>
  `);
  albumGrid.append(col);

  col.find("img").on("click", function () {
    showAlbumDetails(record.id);
  });
}

// Exibir detalhes no modal
function showAlbumDetails(id) {
  return $.ajax({
    url: `https://ucsdiscosapi.azurewebsites.net/Discos/record?numero=${id}`,
    method: "GET",
    headers: {
      tokenapiucs: authToken,
    },
    success: function (record) {
      // Preencher modal
      $("#modalTitle").text(`Álbum ${record.id}`);
      $("#modalImage").attr("src", `data:image/jpeg;base64,${record.imagemEmBase64}`);
      $("#modalDescriptionPrimary").text(record.descricaoPrimaria);
      $("#modalDescriptionSecondary").text(record.descricaoSecundaria);

      // Mostrar modal
      const modal = new bootstrap.Modal($("#albumModal")[0]);
      modal.show();
    },
    error: function () {
      console.error("Erro ao carregar detalhes do disco.");
    },
  });
}

// Inicializar a aplicação
function init() {
  authenticate().then(() => {
    loadRecords(currentIndex, 12);

    // Implementar rolagem infinita
    $(window).on("scroll", function () {
      if ($(window).scrollTop() + $(window).height() >= $(document).height()) {
        currentIndex += 4;
        if (currentIndex > totalRecords) currentIndex = 1; // Reiniciar
        loadRecords(currentIndex, 4);
      }
    });
  });
}

$(document).ready(init);
