import { admin, db } from "../config/firebase.js";

export async function getReports(req, res) {
    try {
        const {id} = req.params;
        const bills = await getBillsLast16Weeks(id);
        const weeklyAggregation = aggregateWeeklyReports(bills, id);
        let formattedReports = Object.entries(weeklyAggregation).map(([_, agg]) => ({
            initialDate: agg.rangeStart,
            quantity: agg.units,
            total: agg.total,
        }));

        if (id) {
            formattedReports = formattedReports.filter(r => (r.quantity || 0) > 0 || (r.total || 0) > 0);
        }
        res.status(200).json({ reports: formattedReports });
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function getBillsLast16Weeks(productId) {
    const sixteenWeeksMs = 16 * 7 * 24 * 60 * 60 * 1000;
    const now = new Date();
    const startDate = new Date(now.getTime() - sixteenWeeksMs);
    const startTimestamp = admin.firestore.Timestamp.fromDate(startDate);

    let query = db
        .collection("bills")
        .where("created_at", ">=", startTimestamp);

    if (productId) {
        query = query
            .where("product_ids", "array-contains", productId)
            .orderBy("created_at", "desc")
            .select("created_at", "products");
    } else {
        query = query
            .orderBy("created_at", "desc")
            .select("created_at", "total", "units_total", "products");
    }

    const billsSnapshot = await query.get();

    return billsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

function getISOWeekKey(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    const year = d.getUTCFullYear();
    const weekPadded = String(weekNo).padStart(2, "0");
    return `${year}-W${weekPadded}`;
}

function aggregateWeeklyReports(bills, productId) {
    const map = {};
    for (const bill of bills) {
        const date = bill.created_at instanceof admin.firestore.Timestamp
            ? bill.created_at.toDate()
            : new Date(bill.created_at);
        const weekKey = getISOWeekKey(date);
        if (!map[weekKey]) {
            const { start, end } = getISOWeekRange(date);
            map[weekKey] = {
                total: 0,
                units: 0,
                rangeStart: formatDate(start),
                rangeEnd: formatDate(end),
            };
        }

        if (productId) {
            const items = (bill.products || []).filter(p => p.id === productId);
            for (const it of items) {
                const units = Number(it.units) || 0;
                const price = Number(it.price) || 0;
                map[weekKey].units += units;
                map[weekKey].total += price * units;
            }
        } else {
            const total = Number(bill.total) || 0;
            const units = bill.units_total !== undefined && bill.units_total !== null
                ? Number(bill.units_total) || 0
                : (bill.products || []).reduce((acc, p) => acc + (Number(p.units) || 0), 0);
            map[weekKey].total += total;
            map[weekKey].units += units;
        }
    }
    return map; 
}

function getISOWeekRange(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    const monday = new Date(d);
    monday.setUTCDate(d.getUTCDate() - (dayNum - 1));
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    return { start: monday, end: sunday };
}

function formatDate(date) {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

