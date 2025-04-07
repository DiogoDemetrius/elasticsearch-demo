import { Client } from '@elastic/elasticsearch';
import axios from 'axios';
import ora from 'ora';

// 📦 Cliente do Elasticsearch
const client = new Client({ node: 'http://localhost:9200' });

// 🔎 Busca todos os livros do autor na Open Library
async function buscarLivrosDoAutor(autor) {
  const spinner = ora(`🔍 Buscando livros do autor "${autor}"...`).start();
  const livros = [];
  let pagina = 1;
  const limite = 100;

  try {
    while (true) {
      const url = `https://openlibrary.org/search.json?author=${encodeURIComponent(autor)}&limit=${limite}&page=${pagina}`;
      const { data } = await axios.get(url);

      if (!data.docs || data.docs.length === 0) break;

      const livrosPagina = data.docs.map((livro, i) => ({
        id: livro.key || `${pagina}-${i}`,
        titulo: livro.title || 'Sem título',
        autor: livro.author_name ? livro.author_name.join(', ') : autor,
        ano: isNaN(Number(livro.first_publish_year)) ? undefined : livro.first_publish_year,
        idioma: livro.language ? livro.language.join(', ') : 'N/A',
        isbn: livro.isbn ? livro.isbn[0] : 'Sem ISBN',
      }));

      livros.push(...livrosPagina);
      if (livrosPagina.length < limite) break;
      pagina++;
    }

    spinner.succeed(`📘 ${livros.length} livros encontrados`);
    return livros;
  } catch (erro) {
    spinner.fail('❌ Erro ao buscar livros');
    throw erro;
  }
}

// 🧹 Remove o índice "livros" se existir
async function resetarIndice() {
  const existe = await client.indices.exists({ index: 'livros' });
  if (existe) {
    await client.indices.delete({ index: 'livros' });
    console.log('🧨 Índice "livros" apagado');
  }
}

// 🏗️ Indexa livros
async function indexarLivros(livros) {
  const spinner = ora('📦 Indexando livros...').start();

  for (const livro of livros) {
    try {
      await client.index({
        index: 'livros',
        id: livro.id,
        document: livro,
      });
    } catch (erro) {
      console.error(`❌ Erro ao indexar ${livro.id}:`, erro.message);
    }
  }

  await client.indices.refresh({ index: 'livros' });
  spinner.succeed('✅ Indexação concluída');
}

// 🔍 Busca por título
async function buscarPorTitulo(titulo) {
  const result = await client.search({
    index: 'livros',
    query: { match: { titulo } },
  });

  console.log(`\n🔎 Resultado por título "${titulo}":\n`, result.hits.hits);
  console.log('---');
}

// 🤖 Busca fuzzy
async function buscarFuzzy(titulo) {
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

  console.log(`\n🤖 Resultado fuzzy para "${titulo}":\n`, result.hits.hits);
  console.log('---');
}

// 📚 Busca por autor com indexação automática
async function buscarPorAutor(autor) {
  const livros = await buscarLivrosDoAutor(autor);

  await resetarIndice();
  await indexarLivros(livros);

  const result = await client.search({
    index: 'livros',
    query: { match: { autor } },
  });

  console.log(`\n📚 Livros indexados do autor "${autor}":\n`, result.hits.hits);
  console.log('---');
}

// 🚀 Execução principal
(async () => {
  const autor = 'Rick Riordan';
  const titulo = 'The Sea of Monsters';
  const tituloErrado = 'The Sea o Monstes';

  //await buscarPorAutor(autor);
  //await buscarPorTitulo(titulo);
  await buscarFuzzy(tituloErrado);
})();
