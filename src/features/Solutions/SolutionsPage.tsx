// Solutions.tsx
import React, { useState, useEffect, useRef } from "react"
import { useQuery, useQueryClient } from "react-query"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { prism } from "react-syntax-highlighter/dist/esm/styles/prism"

// Custom Monochromatic Theme
const monoStyle: any = {
  ...prism,
  "code[class*=\"language-\"]": { color: "#e5e5e5", textShadow: "none" },
  "pre[class*=\"language-\"]": { color: "#e5e5e5", background: "#000000", textShadow: "none" },
  comment: { color: "#666666", fontStyle: "italic" },
  prolog: { color: "#666666" },
  doctype: { color: "#666666" },
  cdata: { color: "#666666" },
  punctuation: { color: "#999999" },
  property: { color: "#e5e5e5" },
  tag: { color: "#e5e5e5" },
  boolean: { color: "#e5e5e5" },
  number: { color: "#e5e5e5" },
  constant: { color: "#e5e5e5" },
  symbol: { color: "#e5e5e5" },
  deleted: { color: "#e5e5e5" },
  selector: { color: "#e5e5e5" },
  "attr-name": { color: "#e5e5e5" },
  string: { color: "#a3a3a3" }, 
  char: { color: "#a3a3a3" },
  builtin: { color: "#e5e5e5" },
  inserted: { color: "#e5e5e5" },
  operator: { color: "#999999" },
  entity: { color: "#e5e5e5" },
  url: { color: "#e5e5e5" },
  variable: { color: "#e5e5e5" },
  atrule: { color: "#e5e5e5" },
  "attr-value": { color: "#a3a3a3" },
  function: { color: "#e5e5e5" },
  "class-name": { color: "#e5e5e5" },
  keyword: { color: "#ffffff", fontWeight: "bold" },
  regex: { color: "#a3a3a3" },
  important: { color: "#e5e5e5", fontWeight: "bold" },
}

import ScreenshotQueue from "../Queue/components/ScreenshotQueue"
import {
  Toast,
  ToastDescription,
  ToastMessage,
  ToastTitle,
  ToastVariant
} from "../../shared/ui/toast"
import { ProblemStatementData } from "../../types/solutions"
import { AudioResult } from "../../types/audio"
import SolutionCommands from "./components/SolutionCommands"
import Debug from "../Debug/DebugPage"

// (Using global ElectronAPI type from src/types/electron.d.ts)

export const ContentSection = ({
  title,
  content,
  isLoading
}: {
  title: string
  content: React.ReactNode
  isLoading: boolean
}) => (
  <div className="space-y-3">
    <h2 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest border-b border-white/10 pb-1">
      {title}
    </h2>
    {isLoading ? (
      <div className="mt-2 flex items-center space-x-2">
        <div className="w-1.5 h-1.5 bg-white animate-pulse" />
        <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
          Analyzing Problem...
        </p>
      </div>
    ) : (
      <div className="text-xs font-mono leading-relaxed text-gray-300 max-w-[600px]">
        {content}
      </div>
    )}
  </div>
)
const SolutionSection = ({
  title,
  content,
  isLoading
}: {
  title: string
  content: React.ReactNode
  isLoading: boolean
}) => (
  <div className="space-y-3">
    <h2 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest border-b border-white/10 pb-1">
      {title}
    </h2>
    {isLoading ? (
      <div className="space-y-2">
        <div className="mt-2 flex items-center space-x-2">
          <div className="w-1.5 h-1.5 bg-white animate-pulse" />
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
            Generating Solution...
          </p>
        </div>
      </div>
    ) : (
      <div className="w-full border border-white/20">
        <SyntaxHighlighter
          showLineNumbers
          language="python"
          style={monoStyle}
          customStyle={{
            maxWidth: "100%",
            margin: 0,
            padding: "1rem",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            backgroundColor: "#000000",
            fontSize: "11px",
            fontFamily: "monospace"
          }}
          wrapLongLines={true}
        >
          {content as string}
        </SyntaxHighlighter>
      </div>
    )}
  </div>
)

export const ComplexitySection = ({
  timeComplexity,
  spaceComplexity,
  isLoading
}: {
  timeComplexity: string | null
  spaceComplexity: string | null
  isLoading: boolean
}) => (
  <div className="space-y-3">
    <h2 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest border-b border-white/10 pb-1">
      Complexity Analysis
    </h2>
    {isLoading ? (
       <div className="mt-2 flex items-center space-x-2">
        <div className="w-1.5 h-1.5 bg-white animate-pulse" />
        <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
          Calculating...
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col space-y-1 p-2 border border-white/10 bg-white/5">
          <span className="text-[10px] font-mono text-gray-500 uppercase">Time</span>
          <span className="text-xs font-mono text-white">{timeComplexity || "N/A"}</span>
        </div>
        <div className="flex flex-col space-y-1 p-2 border border-white/10 bg-white/5">
          <span className="text-[10px] font-mono text-gray-500 uppercase">Space</span>
          <span className="text-xs font-mono text-white">{spaceComplexity || "N/A"}</span>
        </div>
      </div>
    )}
  </div>
)

interface SolutionsProps {
  setView: React.Dispatch<React.SetStateAction<"queue" | "solutions" | "debug">>
}
const Solutions: React.FC<SolutionsProps> = ({ setView }) => {
  const queryClient = useQueryClient()
  const contentRef = useRef<HTMLDivElement>(null)

  // Audio recording state
  const [audioRecording, setAudioRecording] = useState(false)
  const [audioResult, setAudioResult] = useState<AudioResult | null>(null)

  const [debugProcessing, setDebugProcessing] = useState(false)
  const [problemStatementData, setProblemStatementData] =
    useState<ProblemStatementData | null>(null)
  const [solutionData, setSolutionData] = useState<string | null>(null)
  const [thoughtsData, setThoughtsData] = useState<string[] | null>(null)
  const [timeComplexityData, setTimeComplexityData] = useState<string | null>(
    null
  )
  const [spaceComplexityData, setSpaceComplexityData] = useState<string | null>(
    null
  )
  const [customContent, setCustomContent] = useState<string | null>(null)

  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<ToastMessage>({
    title: "",
    description: "",
    variant: "neutral"
  })

  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const [tooltipHeight, setTooltipHeight] = useState(0)

  const [isResetting, setIsResetting] = useState(false)

  const { data: extraScreenshots = [], refetch } = useQuery<Array<{ path: string; preview: string }>, Error>(
    ["extras"],
    async () => {
      try {
        const existing = await window.electronAPI.getScreenshots()
        return existing
      } catch (error) {
        console.error("Error loading extra screenshots:", error)
        return []
      }
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity
    }
  )

  const showToast = (
    title: string,
    description: string,
    variant: ToastVariant
  ) => {
    setToastMessage({ title, description, variant })
    setToastOpen(true)
  }

  const handleDeleteExtraScreenshot = async (index: number) => {
    const screenshotToDelete = extraScreenshots[index]

    try {
      const response = await window.electronAPI.deleteScreenshot(
        screenshotToDelete.path
      )

      if (response.success) {
        refetch() // Refetch screenshots instead of managing state directly
      } else {
        console.error("Failed to delete extra screenshot:", response.error)
      }
    } catch (error) {
      console.error("Error deleting extra screenshot:", error)
    }
  }

  useEffect(() => {
    // Height update logic
    const updateDimensions = () => {
      if (contentRef.current) {
        let contentHeight = contentRef.current.scrollHeight
        const contentWidth = contentRef.current.scrollWidth
        if (isTooltipVisible) {
          contentHeight += tooltipHeight
        }
        window.electronAPI.updateContentDimensions({
          width: contentWidth,
          height: contentHeight
        })
      }
    }

    // Initialize resize observer
    const resizeObserver = new ResizeObserver(updateDimensions)
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current)
    }
    updateDimensions()

    // Set up event listeners
    const cleanupFunctions = [
      window.electronAPI.onScreenshotTaken(() => refetch()),
      window.electronAPI.onResetView(() => {
        // Set resetting state first
        setIsResetting(true)

        // Clear the queries
        queryClient.removeQueries(["solution"])
        queryClient.removeQueries(["new_solution"])

        // Reset other states
        refetch()

        // After a small delay, clear the resetting state
        setTimeout(() => {
          setIsResetting(false)
        }, 0)
      }),
      window.electronAPI.onSolutionStart(async () => {
        // Reset UI state for a new solution
        setSolutionData(null)
        setThoughtsData(null)
        setTimeComplexityData(null)
        setSpaceComplexityData(null)
        setCustomContent(null)
        setAudioResult(null)

        // Start audio recording from user's microphone
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          const mediaRecorder = new MediaRecorder(stream)
          const chunks: Blob[] = []
          mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
          mediaRecorder.start()
          setAudioRecording(true)
          // Record for 5 seconds (or adjust as needed)
          setTimeout(() => mediaRecorder.stop(), 5000)
          mediaRecorder.onstop = async () => {
            setAudioRecording(false)
            const blob = new Blob(chunks, { type: chunks[0]?.type || 'audio/webm' })
            const reader = new FileReader()
            reader.onloadend = async () => {
              const base64Data = (reader.result as string).split(',')[1]
              // Send audio to Gemini for analysis
              try {
                const result = await window.electronAPI.analyzeAudioFromBase64(
                  base64Data,
                  blob.type
                )
                // Store result in react-query cache
                queryClient.setQueryData(["audio_result"], result)
                setAudioResult(result)
              } catch (err) {
                console.error('Audio analysis failed:', err)
              }
            }
            reader.readAsDataURL(blob)
          }
        } catch (err) {
          console.error('Audio recording error:', err)
        }

        // Simulate receiving custom content shortly after start
        setTimeout(() => {
          setCustomContent(
            "This is the dynamically generated content appearing after loading starts."
          )
        }, 1500) // Example delay
      }),
      //if there was an error processing the initial solution
      window.electronAPI.onSolutionError((error: string) => {
        showToast(
          "Processing Failed",
          "There was an error processing your extra screenshots.",
          "error"
        )
        // Reset solutions in the cache (even though this shouldn't ever happen) and complexities to previous states
        const solution = queryClient.getQueryData(["solution"]) as {
          code: string
          thoughts: string[]
          time_complexity: string
          space_complexity: string
        } | null
        if (!solution) {
          setView("queue") //make sure that this is correct. or like make sure there's a toast or something
        }
        setSolutionData(solution?.code || null)
        setThoughtsData(solution?.thoughts || null)
        setTimeComplexityData(solution?.time_complexity || null)
        setSpaceComplexityData(solution?.space_complexity || null)
        console.error("Processing error:", error)
      }),
      //when the initial solution is generated, we'll set the solution data to that
      window.electronAPI.onSolutionSuccess((data) => {
        if (!data?.solution) {
          console.warn("Received empty or invalid solution data")
          return
        }

        console.log({ solution: data.solution })

        const solutionData = {
          code: data.solution.code,
          thoughts: data.solution.thoughts,
          time_complexity: data.solution.time_complexity,
          space_complexity: data.solution.space_complexity
        }

        queryClient.setQueryData(["solution"], solutionData)
        setSolutionData(solutionData.code || null)
        setThoughtsData(solutionData.thoughts || null)
        setTimeComplexityData(solutionData.time_complexity || null)
        setSpaceComplexityData(solutionData.space_complexity || null)
      }),

      //########################################################
      //DEBUG EVENTS
      //########################################################
      window.electronAPI.onDebugStart(() => {
        //we'll set the debug processing state to true and use that to render a little loader
        setDebugProcessing(true)
      }),
      //the first time debugging works, we'll set the view to debug and populate the cache with the data
      window.electronAPI.onDebugSuccess((data) => {
        console.log({ debug_data: data })

        queryClient.setQueryData(["new_solution"], data.solution)
        setDebugProcessing(false)
      }),
      //when there was an error in the initial debugging, we'll show a toast and stop the little generating pulsing thing.
      window.electronAPI.onDebugError(() => {
        showToast(
          "Processing Failed",
          "There was an error debugging your code.",
          "error"
        )
        setDebugProcessing(false)
      }),
      window.electronAPI.onProcessingNoScreenshots(() => {
        showToast(
          "No Screenshots",
          "There are no extra screenshots to process.",
          "neutral"
        )
      })
    ]

    return () => {
      resizeObserver.disconnect()
      cleanupFunctions.forEach((cleanup) => cleanup())
    }
  }, [isTooltipVisible, tooltipHeight])

  useEffect(() => {
    setProblemStatementData(
      queryClient.getQueryData(["problem_statement"]) || null
    )
    setSolutionData(queryClient.getQueryData(["solution"]) || null)

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.query.queryKey[0] === "problem_statement") {
        setProblemStatementData(
          queryClient.getQueryData(["problem_statement"]) || null
        )
        // If this is from audio processing, show it in the custom content section
        const audioResult = queryClient.getQueryData(["audio_result"]) as AudioResult | undefined;
        if (audioResult) {
          // Update all relevant sections when audio result is received
          setProblemStatementData({
            problem_statement: audioResult.text,
            input_format: {
              description: "Generated from audio input",
              parameters: []
            },
            output_format: {
              description: "Generated from audio input",
              type: "string",
              subtype: "text"
            },
            complexity: {
              time: "N/A",
              space: "N/A"
            },
            test_cases: [],
            validation_type: "manual",
            difficulty: "custom"
          });
          setSolutionData(null); // Reset solution to trigger loading state
          setThoughtsData(null);
          setTimeComplexityData(null);
          setSpaceComplexityData(null);
        }
      }
      if (event?.query.queryKey[0] === "solution") {
        const solution = queryClient.getQueryData(["solution"]) as {
          code: string
          thoughts: string[]
          time_complexity: string
          space_complexity: string
        } | null

        setSolutionData(solution?.code ?? null)
        setThoughtsData(solution?.thoughts ?? null)
        setTimeComplexityData(solution?.time_complexity ?? null)
        setSpaceComplexityData(solution?.space_complexity ?? null)
      }
    })
    return () => unsubscribe()
  }, [queryClient])

  const handleTooltipVisibilityChange = (visible: boolean, height: number) => {
    setIsTooltipVisible(visible)
    setTooltipHeight(height)
  }

  return (
    <>
      {!isResetting && queryClient.getQueryData(["new_solution"]) ? (
        <>
          <Debug
            isProcessing={debugProcessing}
            setIsProcessing={setDebugProcessing}
          />
        </>
      ) : (
        <div ref={contentRef} className="relative space-y-3 px-4 py-3">
          <Toast
            open={toastOpen}
            onOpenChange={setToastOpen}
            variant={toastMessage.variant}
            duration={3000}
          >
            <ToastTitle>{toastMessage.title}</ToastTitle>
            <ToastDescription>{toastMessage.description}</ToastDescription>
          </Toast>

          {/* Conditionally render the screenshot queue if solutionData is available */}
          {solutionData && (
            <div className="bg-transparent w-fit">
              <div className="pb-3">
                <div className="space-y-3 w-fit">
                  <ScreenshotQueue
                    isLoading={debugProcessing}
                    screenshots={extraScreenshots}
                    onDeleteScreenshot={handleDeleteExtraScreenshot}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navbar of commands with the SolutionsHelper */}
          <div className="w-fit mx-auto">
            <SolutionCommands
              extraScreenshots={extraScreenshots}
              onTooltipVisibilityChange={handleTooltipVisibilityChange}
            />
          </div>

          {/* Main Content - Modified width constraints */}
          <div className="w-full text-sm text-white bg-black border border-white/20">
            <div className="">
              <div className="px-4 py-3 space-y-4 max-w-full">
                {/* Show Screenshot or Audio Result as main output if validation_type is manual */}
                {problemStatementData?.validation_type === "manual" ? (
                  <ContentSection
                    title={problemStatementData?.output_format?.subtype === "voice" ? "Audio Result" : "Screenshot Result"}
                    content={problemStatementData.problem_statement}
                    isLoading={false}
                  />
                ) : (
                  <>
                    {/* Problem Statement Section - Only for non-manual */}
                    <ContentSection
                      title={problemStatementData?.output_format?.subtype === "voice" ? "Voice Input" : "Problem Statement"}
                      content={problemStatementData?.problem_statement}
                      isLoading={!problemStatementData}
                    />
                    {/* Show loading state when waiting for solution */}
                    {problemStatementData && !solutionData && (
                      <div className="mt-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white animate-pulse" />
                        <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                          {problemStatementData?.output_format?.subtype === "voice" 
                            ? "Processing voice input..." 
                            : "Generating solutions..."}
                        </p>
                      </div>
                    )}
                    {/* Solution Sections (legacy, only for non-manual) */}
                    {solutionData && (
                      <>
                        <ContentSection
                          title="Analysis"
                          content={
                            thoughtsData && (
                              <div className="space-y-3">
                                <div className="space-y-1">
                                  {thoughtsData.map((thought, index) => (
                                    <div
                                      key={index}
                                      className="flex items-start gap-2"
                                    >
                                      <div className="w-1.5 h-1.5 bg-gray-500 mt-1.5 shrink-0" />
                                      <div className="font-mono text-xs text-gray-300 leading-relaxed">{thought}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          }
                          isLoading={!thoughtsData}
                        />
                        <SolutionSection
                          title={problemStatementData?.output_format?.subtype === "voice" ? "Response" : "Solution"}
                          content={solutionData}
                          isLoading={!solutionData}
                        />
                        {problemStatementData?.output_format?.subtype !== "voice" && (
                          <ComplexitySection
                            timeComplexity={timeComplexityData}
                            spaceComplexity={spaceComplexityData}
                            isLoading={!timeComplexityData || !spaceComplexityData}
                          />
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Solutions
