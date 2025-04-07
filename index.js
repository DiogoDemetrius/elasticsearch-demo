const client = require('./elastic/client');
const livros = require('./data/livros.json');

// Função para indexar os dados
async function indexarDados() {
  for (const livro of livros) {
    await client.index({
      index: 'livros',
      id: livro.id,
      document: livro,
    });
  }

  await client.indices.refresh({ index: 'livros' });
  console.log('📥 Dados indexados com sucesso!');
}

// Busca simples por título
async function buscarPorTitulo(titulo) {
  const result = await client.search({
    index: 'livros',
    query: {
      match: { titulo },
    },
  });

  console.log('🔍 Resultado da busca:', result.hits.hits);
}

async function buscarPorAutor(autor) {
  const result = await client.search({
    index: 'livros',
    query: {
      match: { autor },
    },
  });

  const quantidade = result.hits.hits.length;
  console.log(`📚 ${quantidade} livros encontrados do autor "${autor}":`, result.hits.hits);
}


async function buscaFuzzy(titulo) {
  const result = await client.search({
    index: 'livros',
    query: {
      match: {
        titulo: {
          query: titulo,
          fuzziness: 'AUTO',
        },
      },
    },
  });

  console.log('🤖 Resultado fuzzy:', result.hits.hits);
}

// EXECUÇÃO
(async () => {
  await indexarDados();

  await buscarPorAutor('José de Alencar');
  //await buscarPorTitulo('alienista');
  //await buscaFuzzy('lufiola');
})();
