// COLE AQUI O ENDEREÇO REAL DO SITE DO CASAL.
// Se não tiver links separados, basta preencher "site".
const LINKS = {
  site: 'https://noivos.casar.com/caliariheck/',
  presenca: '',
  presentes: '',
  recados: ''
};

const envelope = document.getElementById('envelope');
const abrir = document.getElementById('abrir');
const repetir = document.getElementById('repetir');
const acoes = document.getElementById('acoes');
const instrucao = document.getElementById('instrucao');
const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)');
let estado = 'fechado';

function abrirConvite() {
  if (estado !== 'fechado') return;
  estado = 'abrindo';
  abrir.disabled = true;
  abrir.setAttribute('aria-expanded', 'true');
  envelope.classList.add('abrindo');
  instrucao.textContent = 'Este convite é para você.';

  window.setTimeout(() => {
    envelope.classList.add('aberto');
    window.setTimeout(() => {
      estado = 'aberto';
      acoes.hidden = false;
      instrucao.textContent = 'Esperamos por você para celebrar esse momento especial.';
      acoes.querySelector('a').focus({ preventScroll: true });
    }, movimentoReduzido.matches ? 0 : 1800);
  }, movimentoReduzido.matches ? 0 : 500);
}

abrir.addEventListener('click', abrirConvite);

repetir.addEventListener('click', () => {
  if (estado !== 'aberto') return;
  estado = 'fechando';
  acoes.hidden = true;
  // Remove a transição por um instante para restaurar o estado inicial.
  const partes = envelope.querySelectorAll('.vegetal, .lacre');
  partes.forEach(parte => parte.style.transition = 'none');
  envelope.classList.remove('aberto', 'abrindo');
  abrir.disabled = false;
  abrir.setAttribute('aria-expanded', 'false');
  instrucao.textContent = 'Toque no lacre para abrir nosso convite.';
  void envelope.offsetWidth;
  partes.forEach(parte => parte.style.transition = '');
  estado = 'fechado';
  abrir.focus({ preventScroll: true });
  document.getElementById('inicio').scrollIntoView({ behavior: movimentoReduzido.matches ? 'instant' : 'smooth' });
});

function enderecoValido(valor) {
  try {
    const url = new URL(valor);
    return ['https:', 'http:'].includes(url.protocol);
  } catch {
    return false;
  }
}

document.querySelectorAll('[data-destino]').forEach(link => {
  const endereco = LINKS[link.dataset.destino] || LINKS.site;
  if (enderecoValido(endereco)) {
    link.href = endereco;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  } else {
    link.href = '#aviso';
    link.addEventListener('click', evento => {
      evento.preventDefault();
      document.getElementById('aviso').hidden = false;
    });
  }
});
