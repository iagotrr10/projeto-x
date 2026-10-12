-- ==========================================================================
-- Wish a Drink — schema.sql (MySQL 8 / MariaDB 10.4+)
-- Uso:  mysql -u root -p < sql/schema.sql
-- ==========================================================================
CREATE DATABASE IF NOT EXISTS wishadrink
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wishadrink;

-- --------------------------------------------------------------------------
-- Modelagem de negócio (conforme o diagrama entregue)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS CLIENTE (
  ID_Cliente  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  Nome        VARCHAR(120) NOT NULL,
  Email       VARCHAR(150) NOT NULL,
  Numero      VARCHAR(20)  NULL,
  Dt_Nasc     DATE         NULL,
  CPF         CHAR(11)     NOT NULL,
  Endereco    VARCHAR(255) NULL,
  PRIMARY KEY (ID_Cliente),
  UNIQUE KEY uq_cliente_cpf (CPF),
  UNIQUE KEY uq_cliente_email (Email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ENDERECO_CLIENTE (
  ID_Cliente    INT UNSIGNED NOT NULL,
  Rua_Numero    VARCHAR(255) NOT NULL,
  CEP           CHAR(8)      NOT NULL,
  Cidade        VARCHAR(120) NOT NULL,
  Estado        CHAR(2)      NOT NULL,
  Complemento   VARCHAR(120) NULL,
  Atualizado_Em DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (ID_Cliente),
  CONSTRAINT fk_endereco_cliente FOREIGN KEY (ID_Cliente)
    REFERENCES CLIENTE (ID_Cliente) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS FORNECEDOR (
  ID_Fornecedor INT UNSIGNED NOT NULL AUTO_INCREMENT,
  Nome          VARCHAR(120) NOT NULL,
  Contato       VARCHAR(80)  NULL,
  Endereco      VARCHAR(255) NULL,
  PRIMARY KEY (ID_Fornecedor)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS FUNCIONARIO (
  ID_Funcionario INT UNSIGNED NOT NULL AUTO_INCREMENT,
  Nome           VARCHAR(120) NOT NULL,
  CPF            CHAR(11)     NOT NULL,
  Contato        VARCHAR(80)  NULL,
  PRIMARY KEY (ID_Funcionario),
  UNIQUE KEY uq_funcionario_cpf (CPF)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS PRODUTO (
  ID_Produto    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  Nome          VARCHAR(120) NOT NULL,
  Vencimento    DATE         NULL,
  Descricao     TEXT         NULL,
  Quantidade    INT UNSIGNED NOT NULL DEFAULT 0,
  PC            DECIMAL(10,2) NOT NULL DEFAULT 0.00,   -- preço de compra
  ID_Fornecedor INT UNSIGNED NULL,
  Lote          VARCHAR(40)  NULL,
  DT_Compra     DATE         NULL,
  PRIMARY KEY (ID_Produto),
  KEY idx_produto_fornecedor (ID_Fornecedor),
  CONSTRAINT fk_produto_fornecedor FOREIGN KEY (ID_Fornecedor)
    REFERENCES FORNECEDOR (ID_Fornecedor) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS VENDA (
  ID_Venda       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  Data           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  VT             DECIMAL(10,2) NOT NULL DEFAULT 0.00,   -- valor total
  ID_Cliente     INT UNSIGNED NOT NULL,
  ID_Funcionario INT UNSIGNED NULL,
  End_Entrega    VARCHAR(255) NULL,
  PRIMARY KEY (ID_Venda),
  KEY idx_venda_cliente (ID_Cliente),
  KEY idx_venda_funcionario (ID_Funcionario),
  CONSTRAINT fk_venda_cliente FOREIGN KEY (ID_Cliente)
    REFERENCES CLIENTE (ID_Cliente) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_venda_funcionario FOREIGN KEY (ID_Funcionario)
    REFERENCES FUNCIONARIO (ID_Funcionario) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- Chave primária composta (ID_Produto + ID_Venda)
CREATE TABLE IF NOT EXISTS VENDA_UNIT (
  ID_Produto INT UNSIGNED NOT NULL,
  ID_Venda   INT UNSIGNED NOT NULL,
  Valor      DECIMAL(10,2) NOT NULL,
  Qtd        INT UNSIGNED NOT NULL,
  PRIMARY KEY (ID_Produto, ID_Venda),
  KEY idx_vu_venda (ID_Venda),
  CONSTRAINT fk_vu_produto FOREIGN KEY (ID_Produto)
    REFERENCES PRODUTO (ID_Produto) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_vu_venda FOREIGN KEY (ID_Venda)
    REFERENCES VENDA (ID_Venda) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- Pedidos criados pelo checkout. Os itens são snapshots do catálogo atual.
CREATE TABLE IF NOT EXISTS PEDIDO (
  ID_Pedido       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ID_Cliente      INT UNSIGNED NOT NULL,
  Data            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  VT              DECIMAL(10,2) NOT NULL,
  Status          ENUM('recebido','preparando','enviado','entregue','cancelado') NOT NULL DEFAULT 'recebido',
  Metodo_Pagamento ENUM('pix','cartao','debito','dinheiro','boleto') NOT NULL,
  End_Rua_Numero  VARCHAR(255) NOT NULL,
  End_CEP         CHAR(8) NOT NULL,
  End_Cidade      VARCHAR(120) NOT NULL,
  End_Estado      CHAR(2) NOT NULL,
  End_Complemento VARCHAR(120) NULL,
  Telefone        VARCHAR(20) NOT NULL,
  PRIMARY KEY (ID_Pedido),
  KEY idx_pedido_cliente_data (ID_Cliente, Data),
  CONSTRAINT fk_pedido_cliente FOREIGN KEY (ID_Cliente)
    REFERENCES CLIENTE (ID_Cliente) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS PEDIDO_ITEM (
  ID_Item       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ID_Pedido     BIGINT UNSIGNED NOT NULL,
  Produto_ID    VARCHAR(100) NOT NULL,
  Nome          VARCHAR(180) NOT NULL,
  Valor_Unitario DECIMAL(10,2) NOT NULL,
  Quantidade    SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (ID_Item),
  UNIQUE KEY uq_pedido_item_produto (ID_Pedido, Produto_ID),
  CONSTRAINT fk_pedido_item_pedido FOREIGN KEY (ID_Pedido)
    REFERENCES PEDIDO (ID_Pedido) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------------------------
-- Autenticação (infraestrutura do login em 2 etapas — fora do diagrama)
-- --------------------------------------------------------------------------
-- perfil: 'master' (administra usuários) ou 'comum' (cliente da loja).
-- metodo_2fa: 'email' (código de 6 dígitos) ou 'totp' (app autenticador).
CREATE TABLE IF NOT EXISTS USUARIO (
  ID_Usuario  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  Nome        VARCHAR(120) NOT NULL,
  Email       VARCHAR(150) NOT NULL,
  CPF         CHAR(11)     NOT NULL,
  Senha_Hash  VARCHAR(255) NOT NULL,
  Perfil      ENUM('master','comum') NOT NULL DEFAULT 'comum',
  Metodo_2FA  ENUM('email','totp')   NOT NULL DEFAULT 'email',
  Totp_Secret VARCHAR(64)  NULL,
  ID_Cliente  INT UNSIGNED NULL,
  Criado_Em   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ID_Usuario),
  UNIQUE KEY uq_usuario_email (Email),
  UNIQUE KEY uq_usuario_cpf (CPF),
  KEY idx_usuario_nome (Nome),
  CONSTRAINT fk_usuario_cliente FOREIGN KEY (ID_Cliente)
    REFERENCES CLIENTE (ID_Cliente) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- Código de 2ª etapa enviado por e-mail (guardado só como hash, expira e limita tentativas)
CREATE TABLE IF NOT EXISTS CODIGO_2FA (
  ID_Codigo   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  ID_Usuario  INT UNSIGNED NOT NULL,
  Codigo_Hash VARCHAR(255) NOT NULL,
  Expira_Em   DATETIME     NOT NULL,
  Tentativas  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  Criado_Em   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ID_Codigo),
  KEY idx_codigo_usuario (ID_Usuario),
  CONSTRAINT fk_codigo_usuario FOREIGN KEY (ID_Usuario)
    REFERENCES USUARIO (ID_Usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Log de entradas: só é gravado quando AS DUAS etapas foram concluídas.
CREATE TABLE IF NOT EXISTS LOG_ACESSO (
  ID_Log      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  ID_Usuario  INT UNSIGNED NOT NULL,
  Nome        VARCHAR(120) NOT NULL,                 -- nome no momento do acesso
  Metodo_2FA  ENUM('email','totp') NOT NULL,         -- 2º fator usado
  Data_Hora   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  IP          VARCHAR(45)  NULL,
  PRIMARY KEY (ID_Log),
  KEY idx_log_usuario_data (ID_Usuario, Data_Hora),
  CONSTRAINT fk_log_usuario FOREIGN KEY (ID_Usuario)
    REFERENCES USUARIO (ID_Usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Páginas acessadas por usuários autenticados (sem URL, parâmetros ou conteúdo).
CREATE TABLE IF NOT EXISTS LOG_PAGINA (
  ID_Log_Pagina BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ID_Usuario    INT UNSIGNED NOT NULL,
  Pagina        VARCHAR(80) NOT NULL,
  Data_Hora     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ID_Log_Pagina),
  KEY idx_log_pagina_usuario_data (ID_Usuario, Data_Hora),
  CONSTRAINT fk_log_pagina_usuario FOREIGN KEY (ID_Usuario)
    REFERENCES USUARIO (ID_Usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Controle de tentativas falhas (senha ou 2º fator) para bloquear força bruta.
CREATE TABLE IF NOT EXISTS LOGIN_TENTATIVA (
  ID_Tentativa INT UNSIGNED NOT NULL AUTO_INCREMENT,
  Email        VARCHAR(150) NOT NULL,
  IP           VARCHAR(45)  NOT NULL,
  Criado_Em    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ID_Tentativa),
  KEY idx_lt_email (Email, Criado_Em),
  KEY idx_lt_ip (IP, Criado_Em)
) ENGINE=InnoDB;
