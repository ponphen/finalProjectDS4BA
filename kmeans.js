function kmeans(points, k, maxIter = 100) {
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