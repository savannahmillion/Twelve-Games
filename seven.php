<?php 
	$page_title = "seven swans swimming";
?>
<?php include("includes/head.html");?>

<script src="js/seven.js"></script>

<body id="seven">

	<?php include("includes/header.html");?>
	<?php include("includes/navigation.html");?>

		<div class="main-content center page-wrap">
			<h1>seven swans swimming</h1>

			<div class="game" id="game-canvas">
			</div>

			<div class="about-game" id="about-game">
				<h3>about this game</h3>
				<p>
					Goal: get all the swans across the water without hitting anything!<br/><br/>

					Desktop: move with the left and right arrow keys.<br/>
					Mobile: tap left and right on the game screen to move.<br/>	
				</p>
				<small>Released December 20th, 2014</small>
			</div>

		</div>	

	<?php include("includes/footer.html");?>

	<script type="text/javascript">
		loadGameIfDateIsValid();
	</script>

</body>

</html>