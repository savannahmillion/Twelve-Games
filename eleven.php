<?php 
	$page_title = "eleven pipers piping";
?>
<?php include("includes/head.html");?>

<script src="js/eleven.js"></script>

<body id="eleven">

	<?php include("includes/header.html");?>
	<?php include("includes/navigation.html");?>

		<div class="main-content center page-wrap">
			<h1>eleven pipers piping</h1>

			<div class="game" id="game-canvas">
			</div>

			<div class="about-game" id="about-game">
				<h3>about this game</h3>
				<p>
					Goal: avoid hitting snakes and collect the stockings!<br/><br/>

					Desktop: click to start, turn left and right with the left and right arrow keys.<br/>
					Mobile: tap to start, turn left and right by tapping the left and right sides of the game screen.<br/>	
				</p>
				<small>Released December 24th, 2014</small>
			</div>

		</div>	

	<?php include("includes/footer.html");?>

	<script type="text/javascript">
		loadGameIfDateIsValid();
	</script>

</body>

</html>