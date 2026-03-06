import './styles.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Elemento #app não encontrado.');
}

app.innerHTML = `
  <h1>Hubv4 • Cliente 3D</h1>
  <p>Base pronta para integrar cena 3D e networking em tempo real.</p>
  <small>Próximo passo: inicializar renderer + câmera + loop.</small>
`;
