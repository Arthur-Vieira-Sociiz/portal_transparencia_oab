# Aplicação web

Aplicação React que reúne duas superfícies com permissões e layouts separados:

- `/public`: consulta pública, preparada para incorporação no WordPress;
- `/admin`: manutenção dos dados pela equipe autorizada da OAB-AL.

Execute a aplicação pelo diretório raiz com `pnpm dev`. O Vite encaminha chamadas
locais de `/api` para a API Express na porta 3333.
