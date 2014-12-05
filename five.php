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
				<script type="text/javascript">
					window.addEventListener("load", mainGame);
				</script>
			</div>
		</div>	

	<?php include("includes/footer.html");?>

</body>

</html>