const http = require('http');

const server = http.createServer(async (req, res) => {
    try {
        const url = req.url.split('url=')[1]

        if (!url || url.indexOf('https://cdn.pecan.run')) {
            res.statusCode = 400
            res.end('Invalid url')
            return
        }
        const response = await fetch(url, { signal: AbortSignal.timeout(30000)})

        if (!response.ok) {
            res.statusCode = response.status
            res.end(response.statusText)
            return
        }

        res.writeHead(200, { 
            'Content-Type': 'application/json',
            announce: response.headers.get('announce'),
            'announce-url': response.headers.get('announce-url'),
            date: response.headers.get('date'),
            'profile-title': 'VNI-local',
            'profile-update-interval': response.headers.get('profile-update-interval'),
            'subscription-userinfo': response.headers.get('subscription-userinfo'),
            'alt-svc': response.headers.get('alt-svc'),
        });

        const data = await response.json()

        data.forEach(server => {
            server.routing.rules.unshift({
                "domain": [
                    "domain:mko",
                    "domain:test",
                    "domain:animego.me",
                    "domain:leonardo.osnova.io",
                    "domain:i-exam.ru",
                    "domain:links.rudeal.com",
                    "domain:s.click.aliexpress.com"
                ],
                "outboundTag": "direct",
                "type": "field"
            })
            server.routing.rules.unshift({
                "domain": [
                    "domain:forum.velomania.ru"
                ],
                "outboundTag": "proxy",
                "type": "field"
            })
            server.routing.rules.unshift({
                "domain": [
                    "domain:data.securykit.com"
                ],
                "outboundTag": "block",
                "type": "field"
            })
            server.routing.rules.unshift({
                "domain": [
                    "domain:youtube.com",
                    "domain:youtu.be",
                    "domain:i.ytimg.com",
                    "domain:i9.ytimg.com",
                    "domain:yt3.ggpht.com",
                    "domain:yt4.ggpht.com",
                    "domain:googleapis.com",
                    "domain:jnn-pa.googleapis.com",
                    "domain:googleusercontent.com",
                    "domain:signaler-pa.youtube.com",
                    "domain:youtubei.googleapis.com",
                    "domain:manifest.googlevideo.com",
                    "domain:yt3.googleusercontent.com"
                ],
                "outboundTag": "bye",
                "type": "field"
            })
            server.outbounds.unshift({
                "protocol": "socks",
                "settings": {
                    "servers": [
                        {
                            "address": "0.0.0.0",
                            "port": 8080
                        }
                    ]
                },
                "tag": "bye"
            })
        })
        res.end(JSON.stringify(data));
    } catch (error) {
        if (error.name === 'TimeoutError') {
            res.statusCode = 400
            res.end('Request timed out')
        } else {
            res.statusCode = 400
            res.end(error.message)
        }
    }
});

const PORT = 8080
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
