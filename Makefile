# ==============================================================================
# OP-Stack step-by-step Deployment Makefile
# Developed by: No.6 Gemini (ai-core:no6) for MEYD-605/gemini-oracle
# Supports standard client (op-geth) and alternative client (op-reth)
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Configuration & Default Variables
# ------------------------------------------------------------------------------
# The client to use for the L2 execution engine. Choose: op-geth (default) or op-reth (Midterm 2 assignment)
CLIENT_TYPE      ?= op-geth

# Directory definitions
DATADIR_BASE     ?= ./data
DATADIR_GETH     ?= $(DATADIR_BASE)/geth
DATADIR_RETH     ?= $(DATADIR_BASE)/reth
LOG_DIR          ?= ./logs

# Paths to credentials and configurations
JWT_SECRET       ?= ./jwt.txt
GENESIS_JSON     ?= ./genesis-l2-20260619.json
ROLLUP_JSON      ?= ./rollup.json

# Network and endpoint configurations (Sepolia L1 & Nova L2)
L1_RPC_URL       ?= https://ethereum-sepolia-rpc.publicnode.com
L1_BEACON_URL    ?= ""
L2_HTTP_PORT     ?= 9545
L2_ENGINE_PORT   ?= 8551
OP_NODE_PORT     ?= 9547

# OP-Node P2P Configurations
# Static peer for Nova network (Jizo/Dobby node connection)
P2P_STATIC_PEER  ?= /ip4/141.11.156.4/tcp/9227/p2p/16Uiu2HAmHdqUpMpxmDq1F2Kx6B1uApx8XUfW7tE8VpB2T71e2H1F
P2P_LISTEN_PORT  ?= 9222

# Sequencer configurations (only required if running as sequencer)
SEQUENCER_ENABLED ?= false
SEQUENCER_HTTP    ?= http://141.11.156.4:9545

# ------------------------------------------------------------------------------
# 2. Helpful Guide & Welcome Message
# ------------------------------------------------------------------------------
.PHONY: help
help:
	@echo "=============================================================================="
	@echo "             🤖 OP-STACK DEPLOYMENT MAKEFILE - STEP BY STEP GUIDE             "
	@echo "=============================================================================="
	@echo "This Makefile guides you through deploying an L2 OP-Stack follower node"
	@echo "supporting either 'op-geth' or paradigm's Rust-based 'op-reth' (Midterm 2)."
	@echo ""
	@echo "Current Active Client Type: $(CLIENT_TYPE)"
	@echo ""
	@echo "Step-by-Step Instructions:"
	@echo "  1. Run 'make setup'            - Create directories, generate JWT secret"
	@echo "  2. Run 'make download-config'  - Download rollup/genesis configurations if needed"
	@echo "  3. Run 'make init'             - Initialize the execution engine database"
	@echo "  4. Run 'make run-execution'    - Run the Execution Client (op-geth or op-reth)"
	@echo "  5. Run 'make run-consensus'    - Run the Consensus Client (op-node)"
	@echo "  6. Run 'make check-sync'       - Check sync progress on the consensus node"
	@echo ""
	@echo "Configuration Variables (Override via command line):"
	@echo "  CLIENT_TYPE     : op-geth | op-reth (Default: $(CLIENT_TYPE))"
	@echo "  DATADIR_BASE    : Path to store database files (Default: $(DATADIR_BASE))"
	@echo "  JWT_SECRET      : Path to Engine API JWT secret (Default: $(JWT_SECRET))"
	@echo "  GENESIS_JSON    : Path to L2 genesis JSON config (Default: $(GENESIS_JSON))"
	@echo "  ROLLUP_JSON     : Path to rollup config JSON (Default: $(ROLLUP_JSON))"
	@echo "  L1_RPC_URL      : L1 RPC provider endpoint (Default: $(L1_RPC_URL))"
	@echo "=============================================================================="

# ------------------------------------------------------------------------------
# 3. Initialization and Directory Setup
# ------------------------------------------------------------------------------
.PHONY: setup
setup:
	@echo "🤖 [Step 1/6] Creating directories and generating JWT token..."
	mkdir -p $(DATADIR_BASE) $(LOG_DIR)
	@if [ ! -f $(JWT_SECRET) ]; then \
		echo "Generating new JWT secret at $(JWT_SECRET)..."; \
		openssl rand -hex 32 > $(JWT_SECRET); \
	else \
		echo "JWT secret already exists at $(JWT_SECRET). Skipping generation."; \
	fi
	@echo "Setup complete. Directories and JWT secret configured."

.PHONY: download-config
download-config:
	@echo "🤖 [Step 2/6] Verifying rollup and genesis configurations..."
	@if [ ! -f $(GENESIS_JSON) ]; then \
		echo "Genesis configuration missing. Downloading from central node..."; \
		curl -s -o $(GENESIS_JSON) http://141.11.156.4:8181/genesis.json || \
		(echo "❌ Failed to download genesis.json" && exit 1); \
	else \
		echo "Genesis configuration found: $(GENESIS_JSON)"; \
	fi
	@if [ ! -f $(ROLLUP_JSON) ]; then \
		echo "Rollup configuration missing. Downloading from central node..."; \
		curl -s -o $(ROLLUP_JSON) http://141.11.156.4:8181/rollup.json || \
		(echo "❌ Failed to download rollup.json" && exit 1); \
	else \
		echo "Rollup configuration found: $(ROLLUP_JSON)"; \
	fi
	@echo "Configuration verification complete."

# ------------------------------------------------------------------------------
# 4. Database Initialization
# ------------------------------------------------------------------------------
.PHONY: init
init: setup download-config
	@echo "🤖 [Step 3/6] Initializing Execution Client Database..."
	@if [ "$(CLIENT_TYPE)" = "op-geth" ]; then \
		echo "Initializing op-geth database inside $(DATADIR_GETH)..."; \
		mkdir -p $(DATADIR_GETH); \
		op-geth init --datadir=$(DATADIR_GETH) $(GENESIS_JSON); \
	elif [ "$(CLIENT_TYPE)" = "op-reth" ]; then \
		echo "Initializing op-reth (Rust) database inside $(DATADIR_RETH)..."; \
		mkdir -p $(DATADIR_RETH); \
		reth init --datadir=$(DATADIR_RETH) --chain=$(GENESIS_JSON); \
	else \
		echo "❌ Unsupported CLIENT_TYPE: $(CLIENT_TYPE). Choose op-geth or op-reth."; \
		exit 1; \
	fi
	@echo "Database initialization complete."

# ------------------------------------------------------------------------------
# 5. Launch Targets
# ------------------------------------------------------------------------------
.PHONY: run-execution
run-execution:
	@echo "🤖 [Step 4/6] Launching L2 Execution Client: $(CLIENT_TYPE)..."
	@if [ "$(CLIENT_TYPE)" = "op-geth" ]; then \
		$(MAKE) run-geth; \
	elif [ "$(CLIENT_TYPE)" = "op-reth" ]; then \
		$(MAKE) run-reth; \
	else \
		echo "❌ Unsupported CLIENT_TYPE: $(CLIENT_TYPE)"; \
		exit 1; \
	fi

.PHONY: run-geth
run-geth:
	@echo "Starting op-geth on L2 RPC: $(L2_HTTP_PORT) / Engine API: $(L2_ENGINE_PORT)..."
	op-geth \
		--datadir=$(DATADIR_GETH) \
		--http \
		--http.port=$(L2_HTTP_PORT) \
		--http.addr=0.0.0.0 \
		--http.vhosts="*" \
		--http.corsdomain="*" \
		--http.api=eth,web3,net,debug \
		--authrpc.addr=0.0.0.0 \
		--authrpc.port=$(L2_ENGINE_PORT) \
		--authrpc.jwtsecret=$(JWT_SECRET) \
		--authrpc.vhosts="*" \
		--gcmode=archive \
		--nodiscover \
		--syncmode=full \
		--networkid=$(shell cat $(ROLLUP_JSON) | grep l2_chain_id | tr -dc '0-9')

.PHONY: run-reth
run-reth:
	@echo "Starting op-reth on L2 RPC: $(L2_HTTP_PORT) / Engine API: $(L2_ENGINE_PORT)..."
	reth node \
		--datadir=$(DATADIR_RETH) \
		--chain=$(GENESIS_JSON) \
		--http \
		--http.addr=0.0.0.0 \
		--http.port=$(L2_HTTP_PORT) \
		--http.api=eth,net,web3,debug \
		--authrpc.addr=0.0.0.0 \
		--authrpc.port=$(L2_ENGINE_PORT) \
		--authrpc.jwtsecret=$(JWT_SECRET) \
		--rollup.sequencer-http=$(SEQUENCER_HTTP) \
		--instance 2 \
		--disable-discovery

.PHONY: run-consensus
run-consensus:
	@echo "🤖 [Step 5/6] Launching Consensus Client (op-node) on Port $(OP_NODE_PORT)..."
	op-node \
		--l2=http://127.0.0.1:$(L2_ENGINE_PORT) \
		--l2.jwt-secret=$(JWT_SECRET) \
		--l1=$(L1_RPC_URL) \
		--l1.rpckind=standard \
		--rollup.config=$(ROLLUP_JSON) \
		--rpc.addr=0.0.0.0 \
		--rpc.port=$(OP_NODE_PORT) \
		--p2p.listen.tcp=$(P2P_LISTEN_PORT) \
		--p2p.static=$(P2P_STATIC_PEER) \
		--p2p.peers.hi=30 \
		--p2p.peers.lo=10 \
		--verifier.l1-confs=4 \
		--p2p.sequencer.key=""

# ------------------------------------------------------------------------------
# 6. Verification and Utility Targets
# ------------------------------------------------------------------------------
.PHONY: check-sync
check-sync:
	@echo "🤖 [Step 6/6] Verifying L2 Node Sync status via Local Consensus node..."
	curl -s -X POST -H "Content-Type: application/json" \
		--data '{"jsonrpc":"2.0","method":"optimism_syncStatus","params":[],"id":1}' \
		http://127.0.0.1:$(OP_NODE_PORT) | grep -E "safe_l2|finalized_l2|unsafe_l2|current_l1" || \
		echo "❌ Consensus node unreachable. Make sure op-node is running."

.PHONY: check-execution
check-execution:
	@echo "Querying local L2 Execution Client block number..."
	curl -s -X POST -H "Content-Type: application/json" \
		--data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
		http://127.0.0.1:$(L2_HTTP_PORT)

.PHONY: clean-db
clean-db:
	@echo "⚠️ Backing up database directory before cleaning..."
	@BACKUP_TIME=$$(date +%Y%m%d_%H%M%S); \
	if [ -d $(DATADIR_BASE) ]; then \
		mv $(DATADIR_BASE) $(DATADIR_BASE)_bak_$$BACKUP_TIME && \
		echo "Backup saved to $(DATADIR_BASE)_bak_$$BACKUP_TIME"; \
	fi

.PHONY: clean
clean: clean-db
	@echo "Cleaning transient files..."
	rm -rf $(LOG_DIR) $(JWT_SECRET)
	@echo "Clean completed."
