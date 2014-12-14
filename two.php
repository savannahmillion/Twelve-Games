<?php 
	$page_title = "two turtle doves";
?>
<?php include("includes/head.html");?>

<script src="js/two.js"></script>

<body id="two">

	<?php include("includes/header.html");?>
	<?php include("includes/navigation.html");?>

		<div class="main-content center page-wrap">
			<h1>two turtle doves</h1>

			<div class="game" id="game-canvas">
			</div>

			<div class="about-game" id="about-game">
				<h3>about this game</h3>
				<p>
					Goal: Find the turtle dove amidst the other turtles!<br/><br/>

					Desktop: click to start the game and select a turtle.<br/>
					Mobile: tap to start the game and select a turtle.<br/>
				</p>
				<small>Released December 15th, 2014</small>
			</div>
			
		</div>	

	<?php include("includes/footer.html");?>

	<script type="text/javascript">
		loadGameIfDateIsValid();
	</script>

</body>

</html>