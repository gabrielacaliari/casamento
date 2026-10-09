window.setup = function () {
  if (typeof window.noCanvas === 'function') {
    window.noCanvas();
  }
};

function iniciarConvite() {
  if (document.body.dataset.conviteIniciado) return;

  const LINKS = {
    site: 'https://noivos.casar.com/caliariheck/',
    presenca: 'https://noivos.casar.com/caliariheck/#/rsvp',
    presentes: 'https://noivos.casar.com/caliariheck/#/presentes',
    recados: 'https://noivos.casar.com/caliariheck/#/recados'
  };

  const envelope = document.getElementById('envelope');
  const abrir = document.getElementById('abrir');
  const repetir = document.getElementById('repetir');
  const acoes = document.getElementById('acoes');
  const instrucao = document.getElementById('instrucao');

  const esquerda = envelope?.querySelector('.vegetal-esquerdo');
  const direita = envelope?.querySelector('.vegetal-direito');
  const flores = envelope?.querySelector('.flores-lacre');

  if (!envelope || !abrir || !esquerda || !direita) {
    console.error(
      'Confira os IDs envelope e abrir e as classes ' +
      'vegetal-esquerdo e vegetal-direito no HTML.'
    );
    return;
  }

  document.body.dataset.conviteIniciado = 'sim';

  const movimentoReduzido = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  );

  let estado = 'fechado';
  let quadroAnimacao = null;

  function aplicarEstilo(elemento, propriedade, valor) {
    if (!elemento) return;

    elemento.style.setProperty(
      propriedade,
      String(valor),
      'important'
    );
  }

  // Desativa as animações antigas do CSS.
  const partes = [
    esquerda,
    direita,
    abrir,
    flores
  ].filter(Boolean);

  partes.forEach(parte => {
    aplicarEstilo(parte, 'animation', 'none');
    aplicarEstilo(parte, 'transition', 'none');
  });

  // Configura a profundidade da abertura.
  aplicarEstilo(envelope, 'perspective', '1400px');
  aplicarEstilo(envelope, 'overflow', 'visible');

  aplicarEstilo(esquerda, 'transform-origin', 'left center');
  aplicarEstilo(direita, 'transform-origin', 'right center');

  [esquerda, direita].forEach(aba => {
    aplicarEstilo(aba, 'backface-visibility', 'visible');
    aplicarEstilo(aba, '-webkit-backface-visibility', 'visible');
    aplicarEstilo(aba, 'pointer-events', 'none');
  });

  aplicarEstilo(flores, 'pointer-events', 'none');

  function atualizarAnimacao(progresso) {
    // Primeiro, o lacre e as flores se desprendem.
    const progressoLacre = Math.min(1, progresso / 0.2);

    aplicarEstilo(
      abrir,
      'opacity',
      1 - progressoLacre
    );

    aplicarEstilo(
      abrir,
      'transform',
      `translate(-50%, ${-50 - progressoLacre * 45}%)
       scale(${1 + progressoLacre * 0.12})`
    );

    aplicarEstilo(
      flores,
      'opacity',
      1 - progressoLacre
    );

    aplicarEstilo(
      flores,
      'transform',
      `translate(-50%, ${-50 - progressoLacre * 25}%)
       rotate(-9deg)`
    );

    // Depois, as duas abas se abrem pela emenda central.
    const abertura = Math.max(
      0,
      Math.min(1, (progresso - 0.2) / 0.8)
    );

    const suave = abertura * abertura * (3 - 2 * abertura);
    const angulo = suave * 165;

    aplicarEstilo(
      esquerda,
      'transform',
      `rotateY(${-angulo}deg)`
    );

    aplicarEstilo(
      direita,
      'transform',
      `rotateY(${angulo}deg)`
    );

    // O papel só desaparece ao final do giro.
    const opacidade = abertura <= 0.88
      ? 1
      : Math.max(0, (1 - abertura) / 0.12);

    aplicarEstilo(esquerda, 'opacity', opacidade);
    aplicarEstilo(direita, 'opacity', opacidade);
  }

  function abrirConvite() {
    if (estado !== 'fechado') return;

    estado = 'abrindo';

    abrir.disabled = true;
    abrir.setAttribute('aria-expanded', 'true');

    envelope.classList.remove('abrindo', 'aberto');

    if (instrucao) {
      instrucao.textContent = 'Este convite é para você.';
    }

    const duracao = 4000;
    const inicioAnimacao = performance.now();

    function animar(agora) {
      const progresso = Math.min(
        1,
        (agora - inicioAnimacao) / duracao
      );

      atualizarAnimacao(progresso);

      if (progresso < 1) {
        quadroAnimacao = requestAnimationFrame(animar);
        return;
      }

      quadroAnimacao = null;
      estado = 'aberto';

      if (acoes) {
        acoes.hidden = false;

        const link = acoes.querySelector('a');

        if (link) {
          link.focus({ preventScroll: true });
        }
      }

      if (instrucao) {
        instrucao.textContent =
          'Esperamos por você para celebrar esse momento especial.';
      }
    }

    quadroAnimacao = requestAnimationFrame(animar);
  }

  function restaurarConvite() {
    if (quadroAnimacao !== null) {
      cancelAnimationFrame(quadroAnimacao);
      quadroAnimacao = null;
    }

    estado = 'fechado';

    envelope.classList.remove('abrindo', 'aberto');

    atualizarAnimacao(0);

    abrir.disabled = false;
    abrir.setAttribute('aria-expanded', 'false');

    if (acoes) {
      acoes.hidden = true;
    }

    if (instrucao) {
      instrucao.textContent =
        'Toque no lacre para abrir nosso convite.';
    }
  }

  abrir.addEventListener('click', abrirConvite);

  if (repetir) {
    repetir.addEventListener('click', () => {
      restaurarConvite();

      abrir.focus({ preventScroll: true });

      const inicioPagina = document.getElementById('inicio');

      if (inicioPagina) {
        inicioPagina.scrollIntoView({
          behavior: movimentoReduzido.matches ? 'auto' : 'smooth'
        });
      }
    });
  }

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

        const aviso = document.getElementById('aviso');

        if (aviso) {
          aviso.hidden = false;
        }
      });
    }
  });

  restaurarConvite();
}

// Inicia quando o HTML estiver carregado.
if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    iniciarConvite,
    { once: true }
  );
} else {
  iniciarConvite();
}