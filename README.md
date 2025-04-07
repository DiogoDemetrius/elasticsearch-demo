# 📚 Elasticsearch Demo com Docker e Node.js

Demonstração simples e funcional de como usar o Elasticsearch para indexação e busca de dados com Node.js — ideal para fins educacionais e apresentações.

---

## ⚙️ Tecnologias

- **Elasticsearch** (via Docker)
- **Node.js**
- **JavaScript**
- **Docker Compose**

---

## 🚀 Como rodar o projeto

1. Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/elasticsearch-demo.git
    cd elasticsearch-demo

2. Suba o Elasticsearch com Docker:
    ```bash
    docker compose up -d

3. Instale as dependências do Node:
    ```bash
    npm install

4. Rode o script de indexação e busca:
    ```bash
    node index.js

    Você verá no terminal:

    Indexação dos livros

    Busca exata (match)

    Busca fuzzy (com erro de digitação)