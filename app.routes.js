app.config(function ($routeProvider) {
	$routeProvider

		.when('/login', {
			template: "<demo></demo>"
		})

		.when('/createroom', {
			template: "<createroom></createroom>"
		})

		.when('/conference',{
			template: "<democonferencek></democonferencek>"
		})

		// .when('/conference', {
		// 	template: "<democonferencev2></democonferencev2>"
		// })

		// .when('/conference', {
		// 	template: "<democonference></democonference>"
		// })

		.otherwise({
			redirectTo: '/login'
		})

});