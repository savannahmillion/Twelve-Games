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
				<script type="text/javascript">
					loadGameIfDateIsValid();
				</script>
			</div>
		</div>	

	<?php include("includes/footer.html");?>

</body>

</html>