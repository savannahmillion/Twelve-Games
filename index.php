<?php
  #remove the directory path we don't want
  $request  = str_replace("/Twelve-Games/php/", "", $_SERVER['REQUEST_URI']);
 
  #split the path by '/'
  $params     = split("/", $request);

  $page_title = "Twelve Games";
?>

<?php include("includes/head.html");?>

<body class="background-pattern">

	<?php include("includes/header.html");?>
	<?php include("includes/navigation.html");?>


		<div class="main-content center page-wrap mobile-padding">
			<div class="homepage-banner"></div>
			<!--<img class="banner-img" src="img/twelvegames-banner.png">-->
			<!--<h1 class="homepage">twelve games<br/><span class="emphasis">of</span> xmas</h1>-->
			<p>Starting on December 14, 2014, each day we will post a new micro game (based on the Christmas carol) until December 25th.<br/>
				Twelve tiny games to get you in that holiday spirit.</p>
		</div>

	<?php include("includes/footer.html");?>

</body>

</html>