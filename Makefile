# Shield Frontend Kubernetes Makefile
# This Makefile provides convenient commands for managing the Kubernetes deployment

# Variables
NAMESPACE = shield
KUSTOMIZE_DIR = k8s
DOCKER_IMAGE = ghcr.io/shield-scanner/frontend/shield-frontend:latest

# Default target
.PHONY: help
help: ## Show this help message
	@echo "Shield Frontend Kubernetes Management"
	@echo "====================================="
	@echo ""
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

# Validation and linting
.PHONY: validate
validate: ## Validate all YAML files and Kubernetes manifests
	@echo "🔍 Validating YAML files..."
	@if command -v yamllint >/dev/null 2>&1; then \
		yamllint k8s/*.yaml; \
	else \
		echo "⚠️  yamllint not found. Install with: pip install yamllint"; \
	fi
	@echo "🔍 Validating Kubernetes manifests..."
	@if command -v kubeconform >/dev/null 2>&1; then \
		kubeconform -summary -verbose k8s/*.yaml; \
	else \
		echo "⚠️  kubeconform not found. Install from: https://github.com/yannh/kubeconform"; \
	fi

.PHONY: lint
lint: validate ## Alias for validate

# Kubernetes cluster operations
.PHONY: check-cluster
check-cluster: ## Check if kubectl is configured and cluster is accessible
	@echo "🔍 Checking Kubernetes cluster connection..."
	@kubectl cluster-info --request-timeout=5s
	@kubectl version --client --output=yaml | grep gitVersion

.PHONY: create-namespace
create-namespace: ## Create the shield namespace if it doesn't exist
	@echo "📦 Creating namespace: $(NAMESPACE)"
	@kubectl create namespace $(NAMESPACE) --dry-run=client -o yaml | kubectl apply -f -

# Deployment operations
.PHONY: deploy
deploy: check-cluster create-namespace ## Deploy the application to Kubernetes
	@echo "🚀 Deploying Shield Frontend to Kubernetes..."
	@kubectl apply -f $(KUSTOMIZE_DIR)/
	@echo "✅ Deployment completed!"
	@echo ""
	@echo "📊 Checking deployment status..."
	@$(MAKE) status

.PHONY: apply
apply: deploy ## Alias for deploy

.PHONY: update
update: ## Update the deployment (useful for rolling updates)
	@echo "🔄 Updating Shield Frontend deployment..."
	@kubectl rollout restart deployment/shield-frontend -n $(NAMESPACE)
	@echo "⏳ Waiting for rollout to complete..."
	@kubectl rollout status deployment/shield-frontend -n $(NAMESPACE) --timeout=300s
	@echo "✅ Update completed!"

# Status and monitoring
.PHONY: status
status: ## Show the status of all resources
	@echo "📊 Shield Frontend Status"
	@echo "========================"
	@echo ""
	@echo "🏷️  Namespace:"
	@kubectl get namespace $(NAMESPACE) 2>/dev/null || echo "❌ Namespace $(NAMESPACE) not found"
	@echo ""
	@echo "🚀 Deployments:"
	@kubectl get deployments -n $(NAMESPACE) -o wide 2>/dev/null || echo "❌ No deployments found"
	@echo ""
	@echo "🔄 Pods:"
	@kubectl get pods -n $(NAMESPACE) -o wide 2>/dev/null || echo "❌ No pods found"
	@echo ""
	@echo "🌐 Services:"
	@kubectl get services -n $(NAMESPACE) -o wide 2>/dev/null || echo "❌ No services found"
	@echo ""
	@echo "🔗 Ingress:"
	@kubectl get ingress -n $(NAMESPACE) -o wide 2>/dev/null || echo "❌ No ingress found"

.PHONY: logs
logs: ## Show logs from the shield-frontend pods
	@echo "📜 Shield Frontend Logs"
	@echo "======================="
	@kubectl logs -n $(NAMESPACE) -l app.kubernetes.io/name=shield-frontend --tail=100 -f

.PHONY: describe
describe: ## Describe the main deployment
	@echo "🔍 Shield Frontend Deployment Details"
	@echo "====================================="
	@kubectl describe deployment shield-frontend -n $(NAMESPACE)

# Troubleshooting
.PHONY: events
events: ## Show recent events in the namespace
	@echo "📅 Recent Events in $(NAMESPACE) namespace"
	@echo "=========================================="
	@kubectl get events -n $(NAMESPACE) --sort-by='.lastTimestamp'

.PHONY: debug
debug: ## Debug pod issues (shows pod details and events)
	@echo "🐛 Debug Information"
	@echo "==================="
	@echo ""
	@echo "🔄 Pod Status:"
	@kubectl get pods -n $(NAMESPACE) -o wide
	@echo ""
	@echo "📋 Pod Details:"
	@kubectl describe pods -n $(NAMESPACE) -l app.kubernetes.io/name=shield-frontend
	@echo ""
	@echo "📅 Recent Events:"
	@kubectl get events -n $(NAMESPACE) --sort-by='.lastTimestamp' | tail -20

# Port forwarding for local access
.PHONY: port-forward
port-forward: ## Forward local port 3000 to the shield-frontend service
	@echo "🔗 Port forwarding localhost:3000 -> shield-frontend:80"
	@echo "Access the application at: http://localhost:3000"
	@echo "Press Ctrl+C to stop port forwarding"
	@kubectl port-forward -n $(NAMESPACE) service/shield-frontend 3000:80

.PHONY: forward
forward: port-forward ## Alias for port-forward

# Cleanup operations
.PHONY: delete
delete: ## Delete the shield-frontend deployment
	@echo "🗑️  Deleting Shield Frontend deployment..."
	@kubectl delete -f $(KUSTOMIZE_DIR)/ --ignore-not-found=true
	@echo "✅ Deployment deleted!"

.PHONY: clean
clean: delete ## Alias for delete

.PHONY: clean-namespace
clean-namespace: ## Delete the entire shield namespace (DESTRUCTIVE)
	@echo "⚠️  This will delete the entire $(NAMESPACE) namespace and ALL resources in it!"
	@echo "🔄 Waiting 5 seconds... Press Ctrl+C to cancel"
	@sleep 5
	@kubectl delete namespace $(NAMESPACE) --ignore-not-found=true
	@echo "✅ Namespace $(NAMESPACE) deleted!"

# Development helpers
.PHONY: restart
restart: ## Restart all pods (useful during development)
	@echo "🔄 Restarting Shield Frontend pods..."
	@kubectl rollout restart deployment/shield-frontend -n $(NAMESPACE)
	@kubectl rollout status deployment/shield-frontend -n $(NAMESPACE)

.PHONY: scale
scale: ## Scale the deployment (usage: make scale REPLICAS=3)
	@if [ "$(REPLICAS)" = "" ]; then \
		echo "❌ Please specify REPLICAS. Usage: make scale REPLICAS=3"; \
		exit 1; \
	fi
	@echo "📈 Scaling Shield Frontend to $(REPLICAS) replicas..."
	@kubectl scale deployment shield-frontend -n $(NAMESPACE) --replicas=$(REPLICAS)
	@kubectl rollout status deployment/shield-frontend -n $(NAMESPACE)

# Quick access commands
.PHONY: shell
shell: ## Get a shell in a running pod
	@echo "🐚 Opening shell in shield-frontend pod..."
	@kubectl exec -it -n $(NAMESPACE) $$(kubectl get pods -n $(NAMESPACE) -l app.kubernetes.io/name=shield-frontend -o jsonpath='{.items[0].metadata.name}') -- /bin/sh

.PHONY: config
config: ## Show the current ConfigMap
	@echo "⚙️  Shield Frontend Configuration"
	@echo "================================"
	@kubectl get configmap shield-frontend-config -n $(NAMESPACE) -o yaml

# All-in-one commands
.PHONY: fresh-deploy
fresh-deploy: clean deploy ## Clean everything and deploy fresh
	@echo "🌟 Fresh deployment completed!"

.PHONY: full-status
full-status: status events ## Show comprehensive status including events
	@echo ""
	@echo "🏁 Full status check completed!"
