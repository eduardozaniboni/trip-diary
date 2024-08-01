# Projeto: Diário de Viagem

## Funcionalidades:

1. Entradas de Diário:

-   Adicionar novas entradas de diário com título, descrição e localização atual.
-   Armazenar as entradas de diário usando IndexedDB.
-   Exibir todas as entradas de diário armazenadas.

2. Geolocalização:

-   Capturar a localização atual do usuário ao adicionar uma nova entrada de diário.
-   Exibir a localização na entrada de diário.

3. Web Workers:

-   Usar Web Workers para calcular a distância entre duas localizações armazenadas.

## Estrutura do Projeto:

1. Configuração Inicial:

-   Crie a estrutura básica do projeto com HTML, CSS e JavaScript.
-   Adicione uma interface para adicionar novas entradas de diário e exibir entradas armazenadas.

2. IndexedDB para Armazenamento de Dados:

-   Configure IndexedDB para armazenar as entradas de diário (título, descrição, latitude, longitude, data).
-   Crie funções para adicionar, buscar e exibir entradas no IndexedDB.

3. Captura de Geolocalização:

-   Use a Geolocation API para capturar a localização atual do usuário ao adicionar uma nova entrada de diário.

4. Web Workers:

-   Use Web Workers para calcular a distância entre duas localizações armazenadas, caso o usuário deseje.

## Funcionalidades Adicionais

1. Registro de Usuário:

-   Permitir que novos usuários se registrem fornecendo um nome de usuário e uma senha.
-   Armazenar as informações de registro de forma segura no IndexedDB.

2. Login de Usuário:

-   Permitir que usuários existentes façam login usando seu nome de usuário e senha.
-   Manter a sessão do usuário ativa durante o uso do aplicativo.

3. Entradas de Diário por Usuário:

-   Cada usuário pode ter suas próprias entradas de diário, armazenadas separadamente.
