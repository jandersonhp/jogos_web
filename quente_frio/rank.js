// URL do Google Sheets
const URL_ORIGINAL = "https://script.google.com/macros/s/AKfycbwlWg_NC2NHtjUNYAoZSE_5_Nbi0oA8GSz6Ydy48Lm3t_ovgiB67K9VuCiO5lvAongR/exec";

// Proxy para GET (ler) - api.allorigins.win resolve CORS perfeitamente
const PROXY_GET = "https://api.allorigins.win/raw?url=";

// Elementos DOM
const btnAtualizar = document.getElementById('btnAtualizarRanking');
const btnVoltar = document.getElementById('btnVoltarJogo');
const loadingDiv = document.getElementById('loadingRanking');
const rankingContent = document.getElementById('rankingContent');
const rankingBody = document.getElementById('rankingBody');
const erroDiv = document.getElementById('erroRanking');
const totalJogadoresSpan = document.getElementById('totalJogadores');

async function carregarRanking() {
    loadingDiv.style.display = 'block';
    rankingContent.style.display = 'none';
    erroDiv.style.display = 'none';

    try {
        const urlComProxy = PROXY_GET + encodeURIComponent(URL_ORIGINAL + "?v=" + Date.now());
        
        const response = await fetch(urlComProxy);
        
        if (!response.ok) throw new Error("Erro na requisição");
        
        const dados = await response.json();
        
        if (!dados || !Array.isArray(dados)) {
            throw new Error("Dados inválidos");
        }
        
        // Ordena por tentativas (menor é melhor)
        const rankingOrdenado = [...dados].sort((a, b) => a.tentativas - b.tentativas);
        
        // Limita aos 50 melhores
        const top50 = rankingOrdenado.slice(0, 50);
        
        totalJogadoresSpan.innerHTML = `🏆 TOTAL DE JOGADORES: ${dados.length}`;
        
        if (top50.length === 0) {
            rankingBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">-- NENHUM JOGADOR AINDA --</td</tr>';
        } else {
            let html = "";
            top50.forEach((jogador, idx) => {
                const posicao = idx + 1;
                let medalha = "";
                if (posicao === 1) medalha = "🥇 ";
                else if (posicao === 2) medalha = "🥈 ";
                else if (posicao === 3) medalha = "🥉 ";
                
                const data = new Date(jogador.data).toLocaleDateString('pt-BR');
                
                html += `
                    <tr>
                        <td style="text-align:center; font-weight:bold;">${medalha}${posicao}º</td>
                        <td><strong>${jogador.nome.toUpperCase()}</strong></td>
                        <td style="text-align:center; font-size:18px;">🎯 ${jogador.tentativas}</td>
                        <td style="font-size:11px;">${data}</td>
                    </tr>
                `;
            });
            rankingBody.innerHTML = html;
        }
        
        loadingDiv.style.display = 'none';
        rankingContent.style.display = 'block';
        
    } catch (error) {
        console.error("Erro ao carregar ranking:", error);
        loadingDiv.style.display = 'none';
        erroDiv.style.display = 'block';
        erroDiv.innerHTML = '⚠️ ERRO AO CARREGAR RANKING!<br><br>Verifique sua conexão com a internet. O ranking pode estar temporariamente indisponível.';
    }
}

btnAtualizar.addEventListener('click', () => {
    carregarRanking();
});

btnVoltar.addEventListener('click', () => {
    window.location.href = "index.html";
});

// Carrega o ranking automaticamente ao abrir a página
carregarRanking();