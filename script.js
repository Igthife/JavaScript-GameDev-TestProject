window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1280;
    canvas.height = 720;

    ctx.fillStyle = 'white';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'white';

    class Player{
        constructor(game){
            this.game = game;
            this.collisionX = this.game.width / 2;
            this.collisionY = this.game.height / 2;
            this.collisionRadius = 30;
            this.speedX = 0;
            this.speedY = 0;
            this.speedModifier = 1;
        }
        draw(context){
            context.beginPath();
            context.arc(this.collisionX, this.collisionY, this.collisionRadius,
                 0, Math.PI * 2);

            context.save();
            context.globalAlpha = 0.5;
            context.fill();
            context.restore();
            context.stroke();
            context.beginPath();
            context.moveTo(this.collisionX, this.collisionY);
            context.lineTo(this.game.mouse.x, this.game.mouse.y);
            context.stroke();

        }

        update(){
            this.dx = (this.game.mouse.x - this.collisionX);
            this.dy = (this.game.mouse.y - this.collisionY);
            const distance = Math.hypot(this.dx, this.dy);
            if(distance > this.speedModifier){
                this.speedX = this.dx / distance || 0;
                this.speedY = this.dy / distance || 0;
                
            }else{
                this.speedX = 0;
                this.speedY = 0;
            }

            this.collisionX += this.speedX * this.speedModifier;
            this.collisionY += this.speedY * this.speedModifier;
        }

    }

    class Obstacle{
        constructor(game){
            this.game = game;
            this.collisionX = Math.random() * this.game.width;
            this.collisionY = Math.random() * this.game.height;
            this.collisionRadius = 60;
        }
        draw(context){
            context.beginPath();
            context.arc(this.collisionX, this.collisionY, this.collisionRadius,
                 0, Math.PI * 2);
            context.save();
            context.globalAlpha = 0.5;
            context.fill();
            context.restore();
            context.stroke();
        }
        reposition(){
            this.collisionX = Math.random() * this.game.width;
            this.collisionY = Math.random() * this.game.height;
        }
    }

    class Game{
        constructor(canvas){
            this.canvas = canvas;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.player = new Player(this);
            this.numberOfObstacles = 5;
            this.obstacles = [];
            this.mouse = {
                x: this.width * 0.5,
                y: this.height * 0.5,
                pressed: false
            }

            //event listeners
            window.addEventListener('mousedown', e => {
                this.mouse.x = e.offsetX;
                this.mouse.y = e.offsetY;
                this.mouse.pressed = true;
            });

            window.addEventListener('mouseup', e => {
                this.mouse.x = e.offsetX;
                this.mouse.y = e.offsetY;
                this.mouse.pressed = false;
            });

            window.addEventListener('mousemove', e => {
                if(this.mouse.pressed){
                    this.mouse.x = e.offsetX;
                    this.mouse.y = e.offsetY;
                }
            });
            
            
        }
        render(context){
            this.player.draw(context);
            this.player.update();
            this.obstacles.forEach(obstacle => obstacle.draw(context));
        }
        init(){
            let attempts = 0;
            while(this.obstacles.length < this.numberOfObstacles && attempts < 500){
                attempts++;
                let testObstacle = new Obstacle(this);
                let overlap = false;
                this.obstacles.forEach(obstacle => {
                    const dx = testObstacle.collisionX - obstacle.collisionX;
                    const dy = testObstacle.collisionY - obstacle.collisionY;
                    const distance = Math.hypot(dx, dy);
                    const sumOfRadii = testObstacle.collisionRadius + obstacle.collisionRadius;
                    if(distance < sumOfRadii){
                        overlap = true;
                    }
                });

                if(testObstacle.collisionX < testObstacle.collisionRadius || testObstacle.collisionX > this.width - testObstacle.collisionRadius){
                    overlap = true;
                }else if(testObstacle.collisionY < testObstacle.collisionRadius || testObstacle.collisionY > this.height - testObstacle.collisionRadius){
                    overlap = true;
                }   

                if(!overlap){
                    this.obstacles.push(testObstacle);
                    console.log(testObstacle);
                    console.log("width: " + this.width + " height: " + this.height);
                    console.log("collisionY: " + testObstacle.collisionY + " collisionRadius: " + testObstacle.collisionRadius * 3);


                }else{
                    console.log("Failed");
                }

                attempts++;
            }

            /*
            //Tried solving this problem before watching the video and I think it works
            for(let i = 0; i < this.numberOfObstacles; i++){
                this.obstacles.push(new Obstacle(this));
                
                //added code to prevent obstacles from colliding with each other
                for(let x = 0; x < this.obstacles.length-1; x++){
                    var dx2 = (this.obstacles[this.obstacles.length-1].collisionX - this.obstacles[x].collisionX);
                    var dy2 = (this.obstacles[this.obstacles.length-1].collisionY - this.obstacles[x].collisionY);
                    var distance = Math.hypot(dx2, dy2);
                    while(distance < this.obstacles[0].collisionRadius * 2){
                        this.obstacles[this.obstacles.length-1].reposition();
                        dx2 = (this.obstacles[this.obstacles.length-1].collisionX - this.obstacles[x].collisionX);
                        dy2 = (this.obstacles[this.obstacles.length-1].collisionY - this.obstacles[x].collisionY);
                        distance = Math.hypot(dx2, dy2);
                        x = 0
                    }
                }
            }*/
        }
    }

    const game = new Game(canvas);
    game.init();
    //console.log(game);

    function animate(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.render(ctx);
        requestAnimationFrame(animate);
    }
    animate();

});