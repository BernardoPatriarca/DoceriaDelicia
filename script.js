// Configuração do Supabase
const SUPABASE_URL = 'https://dmxnhandchnyikdxrqsh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRteG5oYW5kY2hueWlrZHhycXNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyMDA2MDgsImV4cCI6MjA1ODc3NjYwOH0.2Oo1o7jm6dyA7XumkO8POF-SxFrkz-bOnUkzFzim2S8';

// Função para inicializar o Supabase
async function initSupabase() {
    try {
        // Cria o cliente Supabase
        const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        
        // Testa a conexão
        const { data, error } = await supabaseClient
            .from('produto')
            .select('*')
            .limit(1);
        
        if (error) throw error;
        
        return supabaseClient;
    } catch (error) {
        console.error('Erro ao conectar com Supabase:', error);
        throw error;
    }
}

// Função para criar confetes
function createConfetti() {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = Math.random() * 10 + 5 + 'px';
        confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        document.body.appendChild(confetti);
        
        // Remove o confete após a animação terminar
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

// Função para animar a imagem de fundo
function animateBackground() {
    const heroSection = document.querySelector('.hero-section');
    heroSection.style.animation = 'floatBackground 15s ease-in-out infinite';
}

// Função para animar as tabelas ao rolar
function animateTablesOnScroll() {
    const tables = document.querySelectorAll('.table-container');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, { threshold: 0.1 });
    
    tables.forEach(table => {
        observer.observe(table);
    });
}

// Função principal
async function initializeApp() {
    try {
        console.log('Iniciando aplicação...');
        
        const supabaseClient = await initSupabase();
        
        // Busca TODOS os produtos de uma vez
        const { data: produtos, error } = await supabaseClient
            .from('produto')
            .select('*')
            .order('nome', { ascending: true });

        if (error) throw error;
        console.log('Produtos recebidos:', produtos);

        if (!produtos || produtos.length === 0) {
            console.log('Nenhum produto encontrado no banco de dados');
            showNoProductsMessage();
            return;
        }

        // Separa os produtos por tipo
        const produtosPorTipo = {
            tipo1: produtos.filter(p => p.tipo === 1), // Bolos
            tipo2: produtos.filter(p => p.tipo === 2), // Cupcakes
            tipo3: produtos.filter(p => p.tipo === 3), // Brigadeiros
            tipo4: produtos.filter(p => p.tipo === 4)  // Tortas
        };

        // Preenche cada tabela com os produtos correspondentes
        fillTable('bolos-table', produtosPorTipo.tipo1, false);
        fillTable('cupcakes-table', produtosPorTipo.tipo2, true);
        fillTable('brigadeiros-table', produtosPorTipo.tipo3, true);
        fillTable('tortas-table', produtosPorTipo.tipo4, false);
        
        // Anima as tabelas quando aparecem na tela
        animateTablesOnScroll();
        
        // Adiciona efeito de confete ao clicar no botão principal
        document.getElementById('mainButton').addEventListener('click', function(e) {
            // Impede o comportamento padrão apenas para demonstrar o efeito
            e.preventDefault();
            createConfetti();
            
            // Rola suavemente para a seção de bolos
            document.querySelector('#bolos').scrollIntoView({
                behavior: 'smooth'
            });
        });
        
        // Anima a imagem de fundo
        animateBackground();

    } catch (error) {
        console.error('Erro na inicialização:', error);
        if (error.code === '42P01') {
            alert('Tabela Produto não encontrada. Verifique se criou a tabela no Supabase.');
        } else {
            alert('Erro ao carregar os dados. Por favor, recarregue a página.');
        }
    }
}

// Função para preencher uma tabela específica com paginação
function fillTable(tableId, produtos, isQuantity) {
    const tableBody = document.querySelector(`#${tableId}`);
    const tableContainer = tableBody.closest('.table-container');
    
    if (!tableBody) {
        console.error(`Elemento #${tableId} não encontrado`);
        return;
    }

    // Remove a paginação existente, se houver
    const existingPagination = tableContainer.querySelector('.pagination-container');
    if (existingPagination) {
        existingPagination.remove();
    }

    tableBody.innerHTML = '';

    if (!produtos || produtos.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted py-4">
                    <i class="fas fa-box-open me-2"></i>Nenhum produto encontrado
                </td>
            </tr>`;
        return;
    }

    // Configuração da paginação
    const itemsPerPage = 10;
    let currentPage = 1;
    const totalPages = Math.ceil(produtos.length / itemsPerPage);

    // Função para mostrar os itens da página atual
    function showPage(page) {
        tableBody.innerHTML = '';
        currentPage = page;
        
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, produtos.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            const product = produtos[i];
            const row = document.createElement('tr');
            
            const sizeColumn = isQuantity 
                ? `${product.tamanho || '--'}` 
                : getSizeText(product.tamanho);

            row.innerHTML = `
                <td>${product.nome || '--'}</td>
                <td>${sizeColumn}</td>
                <td class="price" align="right">R$ ${product.valor?.toFixed(2) || '0.00'}</td>
            `;
            tableBody.appendChild(row);
        }
        
        // Atualiza os controles de paginação
        updatePaginationControls();
    }

    // Função para criar os controles de paginação
    function createPaginationControls() {
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination-container';
        
        const paginationList = document.createElement('ul');
        paginationList.className = 'pagination';
        
        // Botão Anterior
        const prevItem = document.createElement('li');
        prevItem.className = 'page-item';
        prevItem.innerHTML = `<a class="page-link" href="#" aria-label="Previous">&laquo;</a>`;
        prevItem.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) showPage(currentPage - 1);
        });
        paginationList.appendChild(prevItem);
        
        // Números das páginas
        const maxVisiblePages = 3;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        if (startPage > 1) {
            const firstItem = document.createElement('li');
            firstItem.className = 'page-item';
            firstItem.innerHTML = `<a class="page-link" href="#">1</a>`;
            firstItem.addEventListener('click', (e) => {
                e.preventDefault();
                showPage(1);
            });
            paginationList.appendChild(firstItem);
            
            if (startPage > 2) {
                const ellipsisItem = document.createElement('li');
                ellipsisItem.className = 'page-item disabled';
                ellipsisItem.innerHTML = `<span class="page-link">...</span>`;
                paginationList.appendChild(ellipsisItem);
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageItem = document.createElement('li');
            pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
            pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageItem.addEventListener('click', (e) => {
                e.preventDefault();
                showPage(i);
            });
            paginationList.appendChild(pageItem);
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsisItem = document.createElement('li');
                ellipsisItem.className = 'page-item disabled';
                ellipsisItem.innerHTML = `<span class="page-link">...</span>`;
                paginationList.appendChild(ellipsisItem);
            }
            
            const lastItem = document.createElement('li');
            lastItem.className = 'page-item';
            lastItem.innerHTML = `<a class="page-link" href="#">${totalPages}</a>`;
            lastItem.addEventListener('click', (e) => {
                e.preventDefault();
                showPage(totalPages);
            });
            paginationList.appendChild(lastItem);
        }
        
        // Botão Próximo
        const nextItem = document.createElement('li');
        nextItem.className = 'page-item';
        nextItem.innerHTML = `<a class="page-link" href="#" aria-label="Next">&raquo;</a>`;
        nextItem.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage < totalPages) showPage(currentPage + 1);
        });
        paginationList.appendChild(nextItem);
        
        paginationContainer.appendChild(paginationList);
        tableContainer.appendChild(paginationContainer);
    }

    // Função para atualizar os controles de paginação
    function updatePaginationControls() {
        const paginationItems = tableContainer.querySelectorAll('.page-item');
        
        // Atualiza o estado ativo
        paginationItems.forEach(item => {
            const pageLink = item.querySelector('.page-link');
            if (pageLink) {
                const pageNumber = parseInt(pageLink.textContent);
                if (!isNaN(pageNumber)) {
                    item.classList.toggle('active', pageNumber === currentPage);
                }
            }
            
            // Atualiza o estado dos botões anterior/próximo
            if (pageLink.getAttribute('aria-label') === 'Previous') {
                item.classList.toggle('disabled', currentPage === 1);
            } else if (pageLink.getAttribute('aria-label') === 'Next') {
                item.classList.toggle('disabled', currentPage === totalPages);
            }
        });
    }

    // Mostra a primeira página e cria os controles
    showPage(1);
    if (produtos.length > itemsPerPage) {
        createPaginationControls();
    }
}

// Mostra mensagem quando não há produtos
function showNoProductsMessage() {
    const tables = ['bolos-table', 'cupcakes-table', 'brigadeiros-table', 'tortas-table'];
    tables.forEach(tableId => {
        const tableBody = document.querySelector(`#${tableId}`);
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-4">
                        <i class="fas fa-box-open me-2"></i>Nenhum produto encontrado
                    </td>
                </tr>`;
        }
    });
}

// Funções auxiliares
function getTypeText(typeNumber) {
    const types = {
        1: 'Bolo',
        2: 'Cupcake',
        3: 'Brigadeiro',
        4: 'Torta'
    };
    return types[typeNumber] || 'Outro';
}

function getSizeText(size) {
    if (!size) return '--';
    
    const sizeLower = size.toString().toLowerCase();
    const sizes = {
        'p': 'Pequeno',
        'pequeno': 'Pequeno',
        'm': 'Médio',
        'medio': 'Médio',
        'g': 'Grande',
        'grande': 'Grande'
    };
    return sizes[sizeLower] || size;
}

// Inicia a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initializeApp);
