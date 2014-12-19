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
					Goal: properly time the swinging of your lei around your neck (9 times)<br/><br/>

					Desktop: click anywhere while the white flowers pass over the goose's neck.<br/>
					Mobile: tap anywhere while the white flowers pass over the goose's neck.<br/>
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