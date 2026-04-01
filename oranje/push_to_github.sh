#!/bin/bash
# Script para fazer push da branch feature/improvements-2026 para GitHub
# Execute este script após configurar as permissões do GitHub App

set -e

echo "🚀 Push do Projeto Oranje para GitHub"
echo "======================================"
echo ""

# Verificar se estamos no diretório correto
if [ ! -d ".git" ]; then
    echo "❌ Erro: Este script deve ser executado da raiz do projeto"
    exit 1
fi

# Verificar branch atual
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Branch atual: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "feature/improvements-2026" ]; then
    echo "⚠️  Não está na branch correta. Fazendo checkout..."
    git checkout feature/improvements-2026
fi

# Verificar status
echo ""
echo "📊 Status do Git:"
git status --short

# Verificar se há mudanças não commitadas
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo ""
    echo "⚠️  Há mudanças não commitadas. Deseja commitá-las? (s/n)"
    read -r response
    if [ "$response" = "s" ] || [ "$response" = "S" ]; then
        git add .
        echo "Digite a mensagem do commit:"
        read -r commit_msg
        git commit -m "$commit_msg"
    fi
fi

# Fazer push
echo ""
echo "🔄 Fazendo push para GitHub..."
echo "Repositório: Trizco33/-Oranje_vercel"
echo "Branch: feature/improvements-2026"
echo ""

if git push -u origin feature/improvements-2026; then
    echo ""
    echo "✅ Push concluído com sucesso!"
    echo ""
    echo "🎯 Próximos passos:"
    echo "1. Acesse: https://github.com/Trizco33/-Oranje_vercel"
    echo "2. Crie um Pull Request da branch 'feature/improvements-2026' para 'master'"
    echo "3. Aguarde o preview automático do Vercel"
    echo "4. Teste o preview e aprove o merge"
    echo ""
    echo "📄 Documentação completa: /home/ubuntu/oranje_deploy_report.md"
else
    echo ""
    echo "❌ Push falhou!"
    echo ""
    echo "Possíveis causas:"
    echo "1. Permissões do GitHub App não configuradas"
    echo "   → Acesse: https://github.com/apps/abacusai/installations/select_target"
    echo "   → Garanta que o repositório '-Oranje_vercel' tem permissões de escrita"
    echo ""
    echo "2. Token de autenticação expirado"
    echo "   → Execute novamente o processo de autenticação"
    echo ""
    echo "3. Conflitos com o remote"
    echo "   → Execute: git pull origin feature/improvements-2026"
    exit 1
fi
