<?php 
	$page_title = "twelve drummers drumming";
?>
<?php include("includes/head.html");?>

<script src="js/twelve.js"></script>

<body id="twelve">

	<?php include("includes/header.html");?>
	<?php include("includes/navigation.html");?>

		<div class="main-content center page-wrap">
			<h1>twelve drummers drumming</h1>

			<div class="game" id="game-canvas">
			</div>

			<div class="about-game" id="about-game">
				<h3>about this game</h3>
				<p>
					Goal: destroy all twelve drums!<br/><br/>

					Desktop: click to start, move left and right with the arrow keys.<br/>
					Mobile: tap to start, move left and right by pressing the left and right sides of the game screen.<br/>	
				</p>
				<small>Released December 25th, 2014</small>
			</div>

		</div>	

	<?php include("includes/footer.html");?>

	<script type="text/javascript">
		loadGameIfDateIsValid();
	</script>

</body>

</html>