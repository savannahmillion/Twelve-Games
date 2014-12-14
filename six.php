<?php 
	$page_title = "six geese laying";
?>
<?php include("includes/head.html");?>

<script src="js/six.js"></script>

<body id="six">

	<?php include("includes/header.html");?>
	<?php include("includes/navigation.html");?>

		<div class="main-content center page-wrap">
			<h1>six geese laying</h1>

			<div class="game" id="game-canvas">
			</div>

			<div class="about-game" id="about-game">
				<h3>about this game</h3>
				<p>
					Goal: time your hips swinging to keep the hula hoop from falling! (10 times)<br/><br/>

					Desktop: alternate pressing the left and right arrow key.<br/>
					Mobile: alternate tapping the left and right side of the game screen.<br/>
				</p>
				<small>Released December 19th, 2014</small>
			</div>

		</div>	

	<?php include("includes/footer.html");?>

	<script type="text/javascript">
		loadGameIfDateIsValid();
	</script>

</body>

</html>