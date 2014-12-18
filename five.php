<?php 
	$page_title = "five golden rings";
?>
<?php include("includes/head.html");?>

<script src="js/five.js"></script>

<body id="five">

	<?php include("includes/header.html");?>
	<?php include("includes/navigation.html");?>

		<div class="main-content center page-wrap">
			<h1>five golden rings</h1>

			<div class="game" id="game-canvas">
			</div>

			<div class="about-game" id="about-game">
				<h3>about this game</h3>
				<p>
					Goal: catch all five rings on your hand!<br/><br/>

					Desktop: click to start and move with the arrow keys.<br/>
					Mobile: tap to start and hold the left/right sides of the game window to move.<br/>
				</p>
				<small>Released December 18th, 2014</small>
			</div>
			
		</div>	

	<?php include("includes/footer.html");?>

	<script type="text/javascript">
		loadGameIfDateIsValid();
	</script>

</body>

</html>