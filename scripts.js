(function () {
  'use strict';

  // util: só dígitos
  function onlyDigits(value) {
    return value.replace(/\D/g, '');
  }

  // máscara CPF: 000.000.000-00
  function formatCPF(value) {
    value = onlyDigits(value).slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return value;
  }

  // máscara CEP: 00000-000
  function formatCEP(value) {
    value = onlyDigits(value).slice(0, 8);
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    return value;
  }

  // máscara telefone: (00) 00000-0000 ou (00) 0000-0000
  function formatPhone(value) {
    value = onlyDigits(value).slice(0, 11);
    if (value.length <= 10) {
      value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
    } else {
      value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
    }
    return value.replace(/-$/, '');
  }

  // aplicar máscara mantendo o cursor
  function applyMask(input, formatter) {
    const start = input.selectionStart;
    const old = input.value;
    input.value = formatter(input.value);
    const newLen = input.value.length;
    const oldLen = old.length;
    const diff = newLen - oldLen;
    const newPos = Math.max(0, start + diff);
    input.setSelectionRange(newPos, newPos);
  }

  // elementos
  const cpfEl = document.getElementById('cpf');
  const telEl = document.getElementById('telefone');
  const cepEl = document.getElementById('cep');
  const form = document.getElementById('cadastroForm');

  if (cpfEl) {
    cpfEl.setAttribute('inputmode', 'numeric');
    cpfEl.addEventListener('input', e => applyMask(e.target, formatCPF));
  }

  if (telEl) {
    telEl.setAttribute('inputmode', 'tel');
    telEl.addEventListener('input', e => applyMask(e.target, formatPhone));
  }

  if (cepEl) {
    cepEl.setAttribute('inputmode', 'numeric');
    cepEl.addEventListener('input', e => {
      applyMask(e.target, formatCEP);
      const raw = onlyDigits(e.target.value);
      if (raw.length === 8) buscarEndereco(raw);
    });
  }

  // Busca de endereço via ViaCEP
  function buscarEndereco(cep) {
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then(response => response.json())
      .then(data => {
        if (data.erro) {
          alert('CEP não encontrado.');
          return;
        }
        const logradouro = document.getElementById('endereco');
        const bairro = document.getElementById('bairro');
        const cidade = document.getElementById('cidade');
        const estado = document.getElementById('estado');

        if (logradouro) logradouro.value = data.logradouro || '';
        if (bairro) bairro.value = data.bairro || '';
        if (cidade) cidade.value = data.localidade || '';
        if (estado) estado.value = data.uf || '';
      })
      .catch(() => alert('Erro ao consultar o CEP.'));
  }

  // Validação e envio do formulário
  if (form) {
    form.addEventListener('submit', ev => {
      ev.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Enviando...';
      }
      setTimeout(() => {
        alert('Cadastro enviado com sucesso!');
        form.reset();
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Enviar Cadastro';
        }
      }, 1000);
    });
  }
})();
