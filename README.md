# pm2-health-check (untested)

## Warning this module has not yet been tested

This module checks the health of the pm2 processes and turns them over if they do don't respond to the health check.

Include the following code in your app to report health to the PM2 module:

```javascript
process.on('healthcheck', function (packet) {

    // Check the health of your app and infrastructure
    var health = !(Math.random()+.5|0);

    // Send back the status
    process.send({
        type : 'process:msg:healthcheck',
        data : {
            health_check_id: packet.data.health_check_id,
            health: health
        }
    });
});
```
