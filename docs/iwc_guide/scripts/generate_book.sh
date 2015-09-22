#!/bin/bash
#
# Filename: generate_book.sh
#
# Description:
#  A poorly named and written script used to generate a PDF or docx or, really
#  any output format `pandoc` supports from the OZP deployment documentation
#  source files.
#
# WARNINGS:
#  Use of this script may spoil your lunch.  Please scrap it and develop something
#  more robust.



DEFAULT_OUTPUT_FILE_BASENAME="ozp-iwc"
DEFAULT_OUTPUT_FORMAT="pdf"
DEFAULT_OUTPUT_DIR=.


ORDERED_SOURCE_LIST="getting_started/overview.md \
					 getting_started/technologies.md \
					 getting_started/serverComms.md \
					 getting_started/setup.md \
					 getting_started/connecting.md \
					 quickStart.md \
					 getting_started/api/apis.md \
					 getting_started/api/api_requests.md \
					 getting_started/api/api_responses.md \
					 getting_started/api/api_error.md \
					 getting_started/api/api_example.md \
					 core_apis/overview.md \
					 core_apis/common/overview.md \
					 core_apis/common/storing.md \
					 core_apis/common/retrieving.md \
					 core_apis/common/removing.md \
					 core_apis/common/listing.md \
					 core_apis/common/watching.md \
					 core_apis/data/overview.md \
					 core_apis/data/children/overview.md \
					 core_apis/data/children/storing.md \
					 core_apis/data/children/retreiving.md \
					 core_apis/data/children/removing.md \
					 core_apis/intents/overview.md \
					 core_apis/intents/registration.md \
					 core_apis/intents/invocation.md \
					 core_apis/system/overview.md \
					 core_apis/system/launching.md \
					 core_apis/names/overview.md \
					 FAQ.md \
					 additional_guides/app_integration_guide/adding_an_iwc_client_to_an_application.md \
					 additional_guides/app_integration_guide/connecting_iwc_client_to_an_iwc_bus.md \
					 additional_guides/app_integration_guide/making_iwc_api_calls.md \
					 additional_guides/app_integration_guide/iwc_client_files.md \
					 additional_guides/app_integration_guide/making_iwc_api_calls_asynchronous_responses.md \
					 additional_guides/iwc_backend_integration_guide/versioning_tool.md \
					 additional_guides/iwc_backend_integration_guide/iwc_components.md \
					 additional_guides/iwc_backend_integration_guide/iframe_peer_html.md \
					 additional_guides/iwc_backend_integration_guide/gathering_iwc_components_to_host.md \
					 additional_guides/iwc_backend_integration_guide/debugger_html.md"
					 
# !!! PANDOC (pandoc.org) is needed to generate the output file
pandoc_cmd=$(command -v pandoc)
if [ -z "$pandoc_cmd" ]; then
    echo $"pandoc (pandoc.org) is needed to generate the output file!  Please install (or add to your PATH) and rerun." >&2
    exit 1
fi

output_format=${DEFAULT_OUTPUT_FORMAT}
output_file_basename=${DEFAULT_OUTPUT_FILE_BASENAME}
output_dir=${DEFAULT_OUTPUT_DIR}

while [ $# -gt 0 ]
do
    arg=$(echo $1 | sed 's/^-+/-/')
    case "$arg" in
	fmt|format)
	    shift
	    output_format=$1
	    ;;
	fbase)
	    shift
	    output_file_basename=$1
	    ;;
	outdir)
	    shift
	    output_dir=$1
	    ;;
	*)
	    echo $"Unknown option: $arg.  Skipping." 1>&2
	    ;;
    esac
    shift
done

# Move to the source directory
# ASSUMPTION: script is located in src/scripts, so parent directory is source directory
script_dir=$(dirname $0)
script_dir=$(cd $script_dir && pwd)
doc_sources_dir=$(cd $script_dir/../ && pwd)

output_file="${output_dir}/${output_file_basename}.${output_format}"

if [ -e "${output_file}" ]; then
    ts=$(date +"%Y%m%d_%H%M%S%Z")
    echo "INFO: Moving old ${output_file} to ${output_file}.${ts}"
    mv ${output_file} ${output_file}.${ts}
    if [ -e "${output_file}" ]; then
	echo "ERROR: Unable to move/delete ${output_file} for document generation.  Please remove then rerun script." 1>&2
	exit 2
    fi
fi

(cd $doc_sources_dir && $pandoc_cmd --from=markdown_github --toc -V geometry:margin=1in --standalone -o "${output_file}" $ORDERED_SOURCE_LIST)

if [ -e "${output_file}" ]; then
    echo $"Generated file: ${output_file}"
else
    echo $"ERROR: Unable to generate file ${output_file}" 1>&2
fi
