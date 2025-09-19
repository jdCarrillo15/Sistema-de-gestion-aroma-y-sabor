import client from "prom-client";

const register = new client.Registry();

const httpRequestCounter = new client.Counter({
    name: "http_requests_total",
    help: "Número total de peticiones HTTP recibidas",
    labelNames: ["method", "route", "status_code"],
});

const httpRequestDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "Duración de las peticiones HTTP en segundos",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.1, 0.3, 0.5, 1, 1.5, 2, 5],
});

register.registerMetric(httpRequestCounter);
register.registerMetric(httpRequestDuration);

register.setDefaultLabels({
    app: "backend-monitor",
});

export { register, httpRequestCounter, httpRequestDuration };
