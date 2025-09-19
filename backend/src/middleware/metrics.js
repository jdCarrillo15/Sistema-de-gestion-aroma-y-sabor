import { httpRequestCounter, httpRequestDuration } from "../monitoring/prometheus.js";

export const metricsMiddleware = (req, res, next) => {
    const end = httpRequestDuration.startTimer();

    res.on("finish", () => {
        const route = req.route?.path || req.path || "unknown_route";

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
