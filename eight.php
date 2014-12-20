<?php 
	$page_title = "eight maids milking";
?>
<?php include("includes/head.html");?>

<script src="js/eight.js"></script>

<body id="eight">

	<?php include("includes/header.html");?>
	<?php include("includes/navigation.html");?>

		<div class="main-content center page-wrap">
			<h1>eight maids milking</h1>

			<div class="game" id="game-canvas">
			</div>

			<div class="about-game" id="about-game">
				<h3>about this game</h3>
				<p>
					Goal: drop milk into the maids' jars, avoid hitting chickens!<br/><br/>

					Desktop: click to start, move with the left and right arrow keys, drop milk with spacebar.<br/>
					Mobile: tap to start and drop milk, tilt left and right to move.<br/>	
				</p>
				<small>Released December 21st, 2014</small>
			</div>

		</div>	

	<?php include("includes/footer.html");?>

	<script type="text/javascript">
		loadGameIfDateIsValid();
	</script>

</body>

</html>