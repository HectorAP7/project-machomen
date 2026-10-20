# MachoMen — Kubernetes Manifests

## Requisitos
- kubectl configurado
- Cluster disponible (minikube, Docker Desktop, etc.)

## Deploy completo
```bash
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/configmap.yaml
kubectl apply -f kubernetes/secrets.yaml
kubectl apply -f kubernetes/mysql.yaml
kubectl apply -f kubernetes/rabbitmq.yaml
kubectl apply -f kubernetes/eureka-server.yaml
kubectl apply -f kubernetes/ms-auth.yaml
kubectl apply -f kubernetes/ms-productos.yaml
kubectl apply -f kubernetes/ms-usuarios.yaml
kubectl apply -f kubernetes/ms-boletas.yaml
kubectl apply -f kubernetes/ms-notificaciones.yaml
kubectl apply -f kubernetes/api-gateway.yaml
```

## Ver servicios
```bash
kubectl get pods -n machomen
kubectl get services -n machomen
```
