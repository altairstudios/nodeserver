$(function() {
	Morris.Donut({
		element: 'memory-usage-donut',
		data: [{
			label: 'Used',
			value: memory.used
		}, {
			label: 'Free',
			value: memory.free
		}],
		resize: true,
		colors: ['#C41A16', '#31C515']
	});


	Morris.Area({
		element: 'load-usage-chart',
		data: [{
			load: cpus.load[2],
			total: cpus.cpus.length,
			time: '15m'
		}, {
			load: cpus.load[1],
			total: cpus.cpus.length,
			time: '5m'
		}, {
			load: cpus.load[0],
			total: cpus.cpus.length,
			time: '1m'
		}],
		lineColors: ['#C41A16', '#31C515'],
		xkey: 'time',
		ykeys: ['load','total'],
		ymax: cpus.cpus.length,
		ymin: 0,
		labels: ['load','cpus'],
		pointSize: 3,
		hideHover: 'auto',
		resize: true,
		parseTime: false
	});
});