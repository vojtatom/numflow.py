from pprint import pprint

def table(filename):

	table = [[['--', '--', '--'] for rep in repetitions] for num in numpoints ]


	with open(filename, 'r') as file:
		num_lines = sum(1 for line in file)
		file.seek(0)

		for _ in range(num_lines // 3):
			first = file.readline()
			second = file.readline()
			_ = file.readline()

			#print(first[:-1], second[:-1])

			splited = first[12:-1].split(' ')
			num = int(splited[0][:-1])
			rep = int(splited[-1])

			i, j = numpoints.index(num), repetitions.index(rep)

			splited = second[7:-1].split(' ')
			ctime = float(splited[0][:-1])
			stime = float(splited[2][:-1])
			ratio = float(splited[4])

			#print(ctime, stime, ratio)

			table[i][j] = [ctime, stime, ratio]


	#print(table)


	pre = "\\begin{table}[]\n\
	\\centering\n\
	\\resizebox{1.0\\textwidth}{!}{\n\
	\\begin{tabular}{@{}llllllllllllllll@{}}\n\
		\\toprule \\\\\
		& & \\multicolumn{14}{c}{repetitions}\\\\\n\
		& & \\multicolumn{2}{c}{1} & \\multicolumn{2}{c}{10} & \\multicolumn{2}{c}{100} & \\multicolumn{2}{c}{1000} & \\multicolumn{2}{c}{10000} & \\multicolumn{2}{c}{100000} & \\multicolumn{2}{c}{1000000} \\\\ \\cmidrule(lr){3-4} \\cmidrule(lr){5-6} \\cmidrule(lr){7-8} \\cmidrule(lr){9-10} \\cmidrule(lr){11-12} \\cmidrule(lr){13-14} \\cmidrule(lr){15-16} \n\
		number of points & & SciPy     & Cython    & SciPy      & Cython    & SciPy      & Cython     & SciPy       & Cython     & SciPy       & Cython      & SciPy        & Cython      & SciPy         & Cython  \\\\\\midrule\n"

	body = ""
		
	for i, num in enumerate(numpoints):
		body += "	{} & times ".format(num)

		for j, rep in enumerate(repetitions):
			s, c, r = table[i][j]
			try:
				body += "& {0:.2f} & {1:.2f}".format(s, c)
			except:
				body += "& {} & {}".format(s, c)



		body += "\\\\\n	& ratio "
		for j, rep in enumerate(repetitions):
			s, c, r = table[i][j]
			try:
				body += "& \\multicolumn{2}{l}{" + "{0:.2f}".format(r) + "}"
			except:
				body += "& \\multicolumn{2}{l}{" + "{}".format(r) + "}"
		body += "\\\\\n"

	end = "	\\bottomrule \\\\\n\
	\\end{tabular}}\n\
\\end{table}"

	print(pre + body + end)


repetitions = [1, 10, 100, 1000, 10000, 100000, 1000000]
numpoints = [1, 10, 100, 1000, 10000, 100000, 1000000]

table('./benchmarks/interpolation_random.txt')
print("\n")
table('./interpolation_regular.txt')
print("\n")

repetitions = [1, 10, 100]
numpoints = [1, 10, 100, 1000, 10000]

table('./integration_random.txt')
print("\n")
table('./integration_regular.txt')



