# NDN API 
API ini ditulis pada node.js dengan framework Hapi. Server API akan berjalan pada localhost:5000. API ini berfungsi untuk menerima data yang dikirimkan dari suatu client dan akan disimpan pada text csv. 

Sebelum memulai, buat file bernama data.csv pada folder src. CSV tersebut harus memiliki header seperti berikut

```csv
time,a,r,fd,fr,be,tl,tp,tu,tb,sRtt,rto
```

API akan menerima data pada endpoint /data dengan method POST. 

Cara mengirimkan data ke API dari client NDN adalah dengan menginjeksi code berikut ke NDNts. 

## 1. Playback.jsx

Pada file playback.jsx, pada fungsi **onmount()**, setelah deklarasi data, sisipkan kode berikut
```javascript
const Http = new XMLHttpRequest();

      const url = "http://localhost:5000/data";

      Http.open('POST', url);

      Http.setRequestHeader('Content-type', 'application/json');

      let payload = {

        a: data.a,

        r: data.r,

        fd: data.fd,

        fr: data.fr,

        be: data.be,

        tl: data.tl,

        tp: data.tp,

        tu: data.tu,

        tb: data.tb,

        sRtt: data.sRtt,

        rto: data.rto,

      };

  

      Http.send(JSON.stringify(payload));

      Http.onreadystatechange = (e) => {

        // console.log(payload);

        // console.log(Http.responseText);

      }
```

## 2.Connect.js
Pada fungsi sendBeaacon(), sebelum postBeacon(data), sisipkan kode berikut
```javascript
if (data.a === "F" ){

    const Http = new XMLHttpRequest();

    const url = "http://localhost:5000/data";

    Http.open('POST', url);

    Http.setRequestHeader('Content-type', 'application/json');

    let payload = {

      a: data.a,

      r: data.r,

      fd: data.fd,

      fr: data.fr,

      be: data.be,

      tl: data.tl,

      tp: data.tp,

      tu: data.tu,

      tb: data.tb,

      sRtt: data.sRtt,

      rto: data.rto,

    };

  

    Http.send(JSON.stringify(payload));

    Http.onreadystatechange = (e) => {

      // console.log(payload);

      // console.log(Http.responseText);

    }

  }
```



# Installation
Clone repo ini
```shell
git clone https://github.com/AdityaP1502/api.git
```

Kemudian install modules yang digunakan 
```shell
npm install
```

Setelah itu jalankan server
```
npm run start
```

Untuk bagian client
copy playback.jsx dan connect.js yang sudah dimodifikasi ke NDNts-video/src
