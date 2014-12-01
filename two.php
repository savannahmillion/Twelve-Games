<?php 
	$page_title = "a partridge";
?>
<?php include("includes/head.html");?>

<script src="js/two.js"></script>

<body id="two">

	<?php include("includes/header.html");?>
	<?php include("includes/navigation.html");?>

		<div class="main-content center page-wrap">
			<h1>turtle doves</h1>

			<div class="game" id="game-canvas">
				<script type="text/javascript">
					window.addEventListener("load", mainGame);
				</script>
			</div>
		</div>	

	<?php include("includes/footer.html");?>

</body>

</html>