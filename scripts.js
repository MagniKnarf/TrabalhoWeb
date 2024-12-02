const apiKey = "8175fA5f6098c5301022f475da32a2aa";
let authToken = "";
let currentIndex = 1;
const totalRecords = 105;
let isFirstLoad = true;

const albumGrid = $("#album-grid");
const loadingIndicator = $("#loading");

// Loading
$(document).ajaxStart(function () {
  loadingIndicator.show();
});

$(document).ajaxStop(function () {
  loadingIndicator.hide();
});

// Autenticação
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
      alert("Erro ao autenticar.");
    },
  });
}

// Carrega registros de discos
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
      alert("Erro ao carregar registros.");
    },
  });
}

// Cria elemento card para cada disco
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

function showAlbumDetails(id) {
  return $.ajax({
    url: `https://ucsdiscosapi.azurewebsites.net/Discos/record?numero=${id}`,
    method: "GET",
    headers: {
      tokenapiucs: authToken,
    },
    success: function (record) {      
      $("#modalTitle").text(`Álbum ${record.id}`);
      $("#modalImage").attr("src", `data:image/jpeg;base64,${record.imagemEmBase64}`);
      $("#modalDescriptionPrimary").text(record.descricaoPrimaria);
      $("#modalDescriptionSecondary").text(record.descricaoSecundaria);

      const modal = new bootstrap.Modal($("#albumModal")[0]);
      modal.show();
    },
    error: function () {
      alert("Erro ao carregar detalhes do disco.");
    },
  });
}


function init() {
  authenticate().then(() => {
    loadRecords(currentIndex, 12).then(() => {
      isFirstLoad = false;
    });

    // Rolagem infinita
    $(window).on("scroll", function () {
      if ($(window).scrollTop() + $(window).height() >= $(document).height()) {
        if (isFirstLoad) {
          currentIndex = 13;
        } else {
          currentIndex += 4;
        }

        if (currentIndex > totalRecords) currentIndex = 1;
        loadRecords(currentIndex, 4);
      }
    });
  });
}


$(document).ready(init);
