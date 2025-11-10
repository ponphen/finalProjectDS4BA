function kmeans_(points, k, maxIter = 100) {
      // สุ่ม centroid เริ่มต้น
      let centroids = points.slice(0, k).map(p => ({ ...p }));
      let clusters = new Array(points.length).fill(0);

      for (let iter = 0; iter < maxIter; iter++) {
        // จัดกลุ่ม
        for (let i = 0; i < points.length; i++) {
          let minDist = Infinity;
          let cluster = 0;
          for (let c = 0; c < k; c++) {
            const dx = points[i].lat - centroids[c].lat;
            const dy = points[i].lng - centroids[c].lng;
            const dist = dx * dx + dy * dy;
            if (dist < minDist) {
              minDist = dist;
              cluster = c;
            }
          }
          clusters[i] = cluster;
        }

        // คำนวณ centroid ใหม่
        const newCentroids = Array.from({ length: k }, () => ({ lat: 0, lng: 0, count: 0 }));
        points.forEach((p, i) => {
          const c = clusters[i];
          newCentroids[c].lat += p.lat;
          newCentroids[c].lng += p.lng;
          newCentroids[c].count += 1;
        });
        for (let c = 0; c < k; c++) {
          if (newCentroids[c].count > 0) {
            newCentroids[c].lat /= newCentroids[c].count;
            newCentroids[c].lng /= newCentroids[c].count;
          } else {
            newCentroids[c] = centroids[c]; // กัน centroid หาย
          }
        }

        // ถ้า centroid ไม่เปลี่ยนให้หยุด
        if (JSON.stringify(newCentroids) === JSON.stringify(centroids)) break;
        centroids = newCentroids;
      }

      return { clusters, centroids };
    }

function kmeans(points, k, maxIter = 100) {
  if (points.length === 0) return { clusters: [], centroids: [] };

  // 🧮 คำนวณ mean และ std ของแต่ละมิติ
  const meanLat = points.reduce((s, p) => s + p.lat, 0) / points.length;
  const meanLng = points.reduce((s, p) => s + p.lng, 0) / points.length;
  const stdLat = Math.sqrt(points.reduce((s, p) => s + (p.lat - meanLat) ** 2, 0) / points.length);
  const stdLng = Math.sqrt(points.reduce((s, p) => s + (p.lng - meanLng) ** 2, 0) / points.length);

  // 🧭 Normalize ค่า lat/lng ให้มี mean = 0, std = 1
  const normalizedPoints = points.map(p => ({
    lat: (p.lat - meanLat) / stdLat,
    lng: (p.lng - meanLng) / stdLng,
  }));

  // 🎯 สุ่ม centroid เริ่มต้นจากจุดจริง แล้ว normalize ด้วยเช่นกัน
  let centroids = normalizedPoints.slice(0, k).map(p => ({ ...p }));
  let clusters = new Array(points.length).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    // 🔹 Assign แต่ละจุดเข้ากลุ่มที่ใกล้สุด
    for (let i = 0; i < normalizedPoints.length; i++) {
      let minDist = Infinity;
      let cluster = 0;
      for (let c = 0; c < k; c++) {
        const dx = normalizedPoints[i].lat - centroids[c].lat;
        const dy = normalizedPoints[i].lng - centroids[c].lng;
        const dist = dx * dx + dy * dy;
        if (dist < minDist) {
          minDist = dist;
          cluster = c;
        }
      }
      clusters[i] = cluster;
    }

    // 🔸 คำนวณ centroid ใหม่ของแต่ละกลุ่ม
    const newCentroids = Array.from({ length: k }, () => ({ lat: 0, lng: 0, count: 0 }));
    normalizedPoints.forEach((p, i) => {
      const c = clusters[i];
      newCentroids[c].lat += p.lat;
      newCentroids[c].lng += p.lng;
      newCentroids[c].count += 1;
    });

    for (let c = 0; c < k; c++) {
      if (newCentroids[c].count > 0) {
        newCentroids[c].lat /= newCentroids[c].count;
        newCentroids[c].lng /= newCentroids[c].count;
      } else {
        newCentroids[c] = centroids[c]; // กัน centroid หาย
      }
    }

    // ถ้า centroid ไม่เปลี่ยน แสดงว่า converge แล้ว → หยุด loop
    if (JSON.stringify(newCentroids) === JSON.stringify(centroids)) break;
    centroids = newCentroids;
  }

  // 🗺️ คืนค่า centroid กลับเป็น scale เดิม (denormalize)
  const denormCentroids = centroids.map(c => ({
    lat: c.lat * stdLat + meanLat,
    lng: c.lng * stdLng + meanLng
  }));

  return { clusters, centroids: denormCentroids };
}
