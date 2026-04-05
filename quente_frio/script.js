// ============================================
// CATEGORIAS E PALAVRAS
// ============================================
const categorias = {
    frutas: [
        "abacate", "abacaxi", "ameixa", "banana", "caqui", "cereja", "figo", "goiaba", 
        "graviola", "jaca", "kiwi", "laranja", "limao", "maca", "mamao", "manga", 
        "maracuja", "melancia", "morango", "nectarina", "pera", "pessego", "tangerina", "uva",
        "carambola", "coco", "framboesa", "jabuticaba", "pitanga", "roma"
    ],
    objetosEscritorio: [
        "caderno", "calculadora", "caneta", "cadeira", "computador", "grampeador", "lapis", 
        "mesa", "monitor", "mouse", "papel", "pendrive", "prancheta", "regua", "teclado",
        "borracha", "clip", "envelopes", "grampo", "lixeira", "perfurador"
    ],
    objetos: [
        "bola", "cadeira", "caneca", "copo", "faca", "garfo", "livro", "mesa", "prato", 
        "relogio", "tesoura", "tv", "vaso", "ventilador", "xicara", "abajur", "almofada",
        "colher", "espelho", "fone", "quadro", "toalha"
    ],
    automoveis: [
        "caminhao", "carro", "corsa", "fiat", "fusca", "gol", "hilux", "honda", "hyundai", 
        "mercedes", "motocicleta", "onibus", "porsche", "tesla", "toyota", "volkswagen",
        "bmw", "chevette", "ferrari", "ford", "jeep", "land rover", "renault"
    ],
    animais: [
        "cachorro", "gato", "passaro", "peixe", "cavalo", "vaca", "galinha", "elefante", 
        "leao", "tigre", "girafa", "macaco", "coelho", "rato", "camelo", "pinguim",
        "abelha", "aranha", "baleia", "formiga", "golfinho", "papagaio", "zebra"
    ],
    cores: [
        "amarelo", "anil", "azul", "bege", "branco", "ciano", "cinza", "laranja", "lilas", 
        "limao", "marrom", "ouro", "prata", "preto", "rosa", "roxo", "verde", "vermelho",
        "carmim", "creme", "indigo", "magenta", "mostarda", "turquesa", "violeta"
    ],
    profissoes: [
        "advogado", "arquiteto", "bombeiro", "carpinteiro", "dentista", "engenheiro", "farmaceutico",
        "jornalista", "medico", "motorista", "padeiro", "policial", "professor", "veterinario",
        "ator", "cabelereiro", "cozinheiro", "enfermeiro", "fotografo", "musico", "piloto"
    ],
    comidas: [
        "arroz", "batata", "bife", "bolo", "feijao", "frango", "hamburger", "macarrao", 
        "pizza", "queijo", "salada", "sanduiche", "sopa", "sushi", "torrada",
        "acai", "brigadeiro", "coxinha", "lasanha", "omelete", "pastel", "tapioca"
    ]
};

// URL do Google Sheets
const URL_ORIGINAL = "https://script.google.com/macros/s/AKfycbwlWg_NC2NHtjUNYAoZSE_5_Nbi0oA8GSz6Ydy48Lm3t_ovgiB67K9VuCiO5lvAongR/exec";

// Proxies CORS (gratuitos, sem necessidade de permissão)
// Para GET (ler) - usa api.allorigins.win
// Para POST (escrever) - usa corsproxy.io
const PROXY_GET = "https://api.allorigins.win/raw?url=";
const PROXY_POST = "https://corsproxy.io/?";

// ============================================
// FUNÇÕES DE SIMILARIDADE
// ============================================

function calcularSimilaridadeLetras(palpite, alvo) {
    if (palpite === alvo) return 1;
    
    let score = 0;
    let peso = 0;
    
    if (palpite.length === alvo.length) {
        score += 0.3;
    } else {
        const diffTamanho = Math.abs(palpite.length - alvo.length);
        const maxDiff = Math.max(palpite.length, alvo.length);
        const tamanhoSimilarity = Math.max(0, 1 - (diffTamanho / maxDiff));
        score += tamanhoSimilarity * 0.3;
    }
    peso += 0.3;
    
    const maxLen = Math.max(palpite.length, alvo.length);
    let letrasIguais = 0;
    for (let i = 0; i < maxLen; i++) {
        if (i < palpite.length && i < alvo.length && palpite[i] === alvo[i]) {
            letrasIguais++;
        }
    }
    const posSimilarity = letrasIguais / maxLen;
    score += posSimilarity * 0.5;
    peso += 0.5;
    
    const letrasPalpite = palpite.split('');
    const letrasAlvo = alvo.split('');
    let letrasComuns = 0;
    const usado = new Array(letrasAlvo.length).fill(false);
    
    for (let letra of letrasPalpite) {
        const index = letrasAlvo.findIndex((l, i) => l === letra && !usado[i]);
        if (index !== -1) {
            letrasComuns++;
            usado[index] = true;
        }
    }
    const commonSimilarity = letrasComuns / Math.max(palpite.length, alvo.length);
    score += commonSimilarity * 0.2;
    peso += 0.2;
    
    return score / peso;
}

function calcularScore(palpite, palavraSecreta, categoriaSecreta) {
    const categoriaPalpite = encontrarCategoria(palpite);
    
    if (palpite === palavraSecreta) return 100;
    
    let score = 0;
    
    if (categoriaPalpite === categoriaSecreta) {
        score += 40;
    }
    
    const similaridadeLetras = calcularSimilaridadeLetras(palpite, palavraSecreta);
    score += similaridadeLetras * 60;
    
    return Math.min(100, Math.max(0, Math.floor(score)));
}

function encontrarCategoria(palavra) {
    for (let [cat, palavras] of Object.entries(categorias)) {
        if (palavras.includes(palavra)) {
            return cat;
        }
    }
    return null;
}

function getTemperatura(score) {
    if (score === 100) return { nome: "ACERTOU!!!", icone: "🏆🔥🏆", classe: "acertou" };
    if (score >= 80) return { nome: "FERVENDO 🔥🔥🔥", icone: "🔥🔥🔥", classe: "fervendo" };
    if (score >= 65) return { nome: "MUITO QUENTE 🔥🔥", icone: "🔥🔥", classe: "muitoQuente" };
    if (score >= 50) return { nome: "QUENTE 🔥", icone: "🔥", classe: "quente" };
    if (score >= 35) return { nome: "MORNO ☀️", icone: "☀️", classe: "morno" };
    if (score >= 20) return { nome: "FRIO ❄️", icone: "❄️", classe: "frio" };
    return { nome: "MUITO FRIO ❄️❄️", icone: "❄️❄️", classe: "muitoFrio" };
}

// ============================================
// RANKING COM PROXY CORS
// ============================================

async function salvarNoRanking(nome, tentativas) {
    try {
        const urlComProxy = PROXY_POST + encodeURIComponent(URL_ORIGINAL);
        
        const response = await fetch(urlComProxy, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                nome: nome,
                tentativas: tentativas,
                data: new Date().toISOString()
            })
        });
        
        const resultado = await response.json();
        return resultado.status === "ok";
    } catch (error) {
        console.error("Erro ao salvar ranking:", error);
        return false;
    }
}

// ============================================
// ESTADO DO JOGO
// ============================================
let palavraSecreta = "";
let categoriaSecreta = "";
let historico = [];
let jogoAtivo = true;
let venceu = false;
let chutesInvalidos = 0;
let dicaRevelada = false;

// Elementos DOM
const inputPalpite = document.getElementById('palpiteInput');
const btnChutar = document.getElementById('btnChutar');
const btnReset = document.getElementById('btnReset');
const btnVerRanking = document.getElementById('btnVerRanking');
const tempIconDiv = document.getElementById('tempIcon');
const tempMsgDiv = document.getElementById('tempMsg');
const detalhesTempDiv = document.getElementById('detalhesTemp');
const historicoBody = document.getElementById('historicoBody');
const errorMsgDiv = document.getElementById('errorMsg');
const ultimoChuteMsgDiv = document.getElementById('ultimoChuteMsg');
const dicaArea = document.getElementById('dicaArea');
const dicaTexto = document.getElementById('dicaTexto');
const categoriaSecretaDisplay = document.getElementById('categoriaSecretaDisplay');
const modalRanking = document.getElementById('modalRanking');
const modalTentativas = document.getElementById('modalTentativas');
const nomeJogadorInput = document.getElementById('nomeJogador');
const btnSalvarRanking = document.getElementById('btnSalvarRanking');
const btnCancelarRanking = document.getElementById('btnCancelarRanking');

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function mostrarErro(mensagem) {
    errorMsgDiv.textContent = `❌ ${mensagem}`;
    errorMsgDiv.classList.add('show');
    setTimeout(() => {
        errorMsgDiv.classList.remove('show');
    }, 3500);
}

function atualizarUltimoChuteMsg(palpite, score, temperatura, acertou = false) {
    if (acertou) {
        ultimoChuteMsgDiv.innerHTML = `🎉 ÚLTIMO CHUTE: "${palpite}" → ACERTOU! PARABÉNS! 🎉`;
        ultimoChuteMsgDiv.className = "ultimo-chute-msg acertou";
    } else if (score >= 50) {
        ultimoChuteMsgDiv.innerHTML = `🔥 ÚLTIMO CHUTE: "${palpite}" → Score: ${score}% (${temperatura.nome}) 🔥`;
        ultimoChuteMsgDiv.className = "ultimo-chute-msg quente";
    } else {
        ultimoChuteMsgDiv.innerHTML = `❄️ ÚLTIMO CHUTE: "${palpite}" → Score: ${score}% (${temperatura.nome}) ❄️`;
        ultimoChuteMsgDiv.className = "ultimo-chute-msg frio";
    }
}

function revelarDica() {
    if (dicaRevelada) return;
    
    const numLetras = palavraSecreta.length;
    const categoria = categoriaSecreta;
    
    dicaTexto.innerHTML = `📌 CATEGORIA: "${categoria.toUpperCase()}" | 📏 ${numLetras} LETRAS`;
    dicaArea.style.display = "block";
    dicaRevelada = true;
}

function escolherPalavraSecreta() {
    const categoriasLista = Object.keys(categorias);
    const catAleatoria = categoriasLista[Math.floor(Math.random() * categoriasLista.length)];
    const palavrasDaCategoria = categorias[catAleatoria];
    const palavraAleatoria = palavrasDaCategoria[Math.floor(Math.random() * palavrasDaCategoria.length)];
    return { palavra: palavraAleatoria, categoria: catAleatoria };
}

function renderizarHistorico() {
    if (!historico.length) {
        historicoBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">-- NENHUM CHUTE AINDA --</td</tr>';
        return;
    }
    
    const historicoOrdenado = [...historico].sort((a, b) => b.score - a.score);
    
    let html = "";
    historicoOrdenado.forEach((item, idx) => {
        const num = idx + 1;
        html += `
            <tr>
                <td>${num}</td>
                <td><strong>${item.palpite}</strong></td>
                <td>${item.categoria || "???"}</td>
                <td style="text-align:center; font-weight:bold;">${item.score}%</td>
                <td class="temp-icone">${item.temperatura.icone} ${item.temperatura.nome}</td>
            </tr>
        `;
    });
    historicoBody.innerHTML = html;
}

function atualizarFeedback(tempObj, score = null) {
    if (venceu) {
        tempIconDiv.innerHTML = "🏆✨🏆";
        tempMsgDiv.innerHTML = `VOCÊ VENCEU! A palavra era "${palavraSecreta.toUpperCase()}" (${categoriaSecreta.toUpperCase()})`;
        detalhesTempDiv.innerHTML = `🏅 Acertou em ${historico.length} tentativas!`;
        return;
    }
    if (!tempObj) {
        tempIconDiv.innerHTML = "❄️❄️❄️";
        tempMsgDiv.innerHTML = "⚡ FAÇA SEU PRIMEIRO CHUTE ⚡";
        detalhesTempDiv.innerHTML = "";
        return;
    }
    tempIconDiv.innerHTML = tempObj.icone;
    tempMsgDiv.innerHTML = `${tempObj.nome}`;
    
    let detalhe = "";
    if (score >= 80) detalhe = "🔥🔥🔥 Muito perto! Continue assim!";
    else if (score >= 50) detalhe = "🔥 Está no caminho certo!";
    else if (score >= 35) detalhe = "☀️ Morno... tente outra categoria ou letras parecidas";
    else detalhe = "❄️ Está longe. Tente uma palavra diferente!";
    
    detalhesTempDiv.innerHTML = `Score: ${score}% - ${detalhe}`;
}

function mostrarModalRanking(tentativas) {
    modalTentativas.textContent = tentativas;
    modalRanking.style.display = "flex";
    nomeJogadorInput.value = "";
    nomeJogadorInput.focus();
}

function fecharModal() {
    modalRanking.style.display = "none";
}

// ============================================
// PROCESSAR PALPITE
// ============================================
async function processarPalpite(palpiteRaw) {
    if (!jogoAtivo && venceu) {
        mostrarErro("Jogo já acabou! Clique em NOVA PARTIDA");
        return false;
    }
    
    let palpite = palpiteRaw.trim().toLowerCase();
    
    if (palpite === "") {
        mostrarErro("Digite uma palavra antes de chutar!");
        return false;
    }
    
    const categoriaPalpite = encontrarCategoria(palpite);
    
    if (!categoriaPalpite) {
        mostrarErro(`"${palpite}" não está em nenhuma categoria do jogo.`);
        return false;
    }
    
    if (historico.some(item => item.palpite === palpite)) {
        mostrarErro(`Você já chutou "${palpite}"! Tente outra.`);
        return false;
    }
    
    const score = calcularScore(palpite, palavraSecreta, categoriaSecreta);
    const temperatura = getTemperatura(score);
    
    historico.push({
        palpite: palpite,
        categoria: categoriaPalpite,
        score: score,
        temperatura: temperatura
    });
    
    const acertou = (score === 100);
    atualizarUltimoChuteMsg(palpite, score, temperatura, acertou);
    
    if (!acertou) {
        chutesInvalidos++;
        if (chutesInvalidos >= 3 && !dicaRevelada && !venceu) {
            revelarDica();
        }
    }
    
    renderizarHistorico();
    atualizarFeedback(temperatura, score);
    
    if (acertou) {
        venceu = true;
        jogoAtivo = false;
        atualizarFeedback(temperatura, score);
        inputPalpite.disabled = true;
        btnChutar.disabled = true;
        categoriaSecretaDisplay.textContent = categoriaSecreta.toUpperCase();
        
        mostrarModalRanking(historico.length);
    }
    
    return true;
}

// ============================================
// REINICIAR JOGO
// ============================================
function reiniciarJogo() {
    const { palavra, categoria } = escolherPalavraSecreta();
    palavraSecreta = palavra;
    categoriaSecreta = categoria;
    historico = [];
    jogoAtivo = true;
    venceu = false;
    chutesInvalidos = 0;
    dicaRevelada = false;
    
    inputPalpite.disabled = false;
    btnChutar.disabled = false;
    inputPalpite.value = "";
    inputPalpite.focus();
    
    categoriaSecretaDisplay.textContent = "???";
    dicaArea.style.display = "none";
    dicaTexto.innerHTML = "";
    ultimoChuteMsgDiv.innerHTML = "⚡ Aguardando primeiro chute...";
    ultimoChuteMsgDiv.className = "ultimo-chute-msg";
    
    renderizarHistorico();
    atualizarFeedback(null);
    
    console.log(`[DEBUG] Palavra: ${palavraSecreta} | Categoria: ${categoriaSecreta}`);
}

// ============================================
// EVENTOS
// ============================================
btnChutar.addEventListener('click', () => {
    processarPalpite(inputPalpite.value);
    inputPalpite.value = "";
    inputPalpite.focus();
});

inputPalpite.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        processarPalpite(inputPalpite.value);
        inputPalpite.value = "";
        inputPalpite.focus();
    }
});

btnReset.addEventListener('click', () => {
    reiniciarJogo();
});

btnVerRanking.addEventListener('click', () => {
    window.location.href = "rank.html";
});

btnSalvarRanking.addEventListener('click', async () => {
    const nome = nomeJogadorInput.value.trim();
    if (!nome) {
        alert("Digite seu nome!");
        return;
    }
    
    const tentativas = historico.length;
    const salvou = await salvarNoRanking(nome, tentativas);
    fecharModal();
    
    if (salvou) {
        alert(`🏆 Pontuação salva! ${nome} - ${tentativas} tentativas`);
    } else {
        alert(`⚠️ Erro ao salvar. O ranking pode não estar funcionando, mas sua pontuação foi anotada localmente.`);
    }
});

btnCancelarRanking.addEventListener('click', () => {
    fecharModal();
});

window.addEventListener('click', (e) => {
    if (e.target === modalRanking) {
        fecharModal();
    }
});

// ============================================
// INICIALIZAÇÃO
// ============================================
reiniciarJogo();