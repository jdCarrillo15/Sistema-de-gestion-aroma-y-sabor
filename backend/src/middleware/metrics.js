import { httpRequestCounter, httpRequestDuration } from "../monitoring/prometheus.js";

const ignoredRoutes = [
    "/favicon.ico",
    "/metrics",
    "/sitemap.xml",
    "/aws/env.yaml",
    "/pdown",
    "/device.rsp",
    "/ws/v1/cluster/apps/new-application"
];

export const metricsMiddleware = (req, res, next) => {
    const end = httpRequestDuration.startTimer();

    res.on("finish", () => {
        const route = req.route?.path || req.path || "unknown_route";
        if (ignoredRoutes.includes(route) || res.statusCode === 404) return;

        httpRequestCounter.inc({
            method: req.method,
            route: route,
            status_code: res.statusCode,
        });

        end({
            method: req.method,
            route: route,
            status_code: res.statusCode,
        });
    });

    next();
};
